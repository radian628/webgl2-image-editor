import { createVirtualFilesystem } from "../../../filesystem/fs-virtual/FsVirtual";
import { GLSLValue, constructVectorValue } from "../evaluator/evaluator";
import {
  makeGLSLLanguageServer,
  Scope,
  ScopeItem,
} from "../langsupport/glsl-language-server";
import {
  ASTNode,
  Commented,
  dummyNode,
  Expr,
  FullySpecifiedType,
  function_prototype,
  FunctionCallExpr,
  FunctionHeader,
  ParameterDeclaration,
} from "../parser/parser";
import { lexGLSL, tryParseGLSLRaw } from "../parser/parser-combined";
import {
  Arity,
  builtinTypes,
  getArity,
  GLSLType,
  PType,
  stringifyType,
  TypeResult,
} from "../typechecker/glsltype";
import {
  builtinType,
  getPrimitiveStringFromTypeAndArity,
  getTypePrimitiveArity,
  getTypePrimitiveCategory,
  isArrayType,
  nodeTypeErr,
  TypeError,
} from "../typechecker/typecheck";

function functionHeader(
  name: string,
  retType: FullySpecifiedType,
  args: ASTNode<ParameterDeclaration>[]
): Commented<FunctionHeader> {
  return dummyNode<FunctionHeader>({
    fullySpecifiedType: dummyNode(retType),
    parameters: dummyNode(args),
    name: dummyNode(name),
  });
}

function namedParam(
  name: string,
  type: FullySpecifiedType
): Commented<ParameterDeclaration> {
  return dummyNode<ParameterDeclaration>({
    declaratorOrSpecifier: {
      type: "declarator",
      declarator: dummyNode({
        identifier: dummyNode(name),
        typeSpecifier: type.specifier,
      }),
    },
  });
}

function fnsig(source: string, replaceName?: string) {
  const tokens = lexGLSL(source).unsafeExpectSuccess();
  const parsed = tryParseGLSLRaw(tokens, function_prototype);
  if (replaceName) parsed.data.name.data = replaceName;
  return parsed;
}

function genericVectorConstructor(
  name: string,
  intendedArity: 1 | 2 | 3 | 4,
  retType = name
) {
  return (
    fncall: ASTNode<FunctionCallExpr>,
    types: { type: GLSLType | undefined; expr: ASTNode<Expr> }[]
  ): TypeResult => {
    let slots = 0;
    let errors: TypeError = [];
    let slotsUnknown = false;
    for (const t of types) {
      const arity = getArity(t.type);
      if (t.type && (!arity || t.type.type !== "primitive")) {
        slotsUnknown = true;
        errors = errors.concat(
          nodeTypeErr(
            t.expr,
            `Argument of type '${stringifyType(t.type)}' is not compatible with function '${name}'.`
          )
        );
      }
      if (arity) slots += arity;
    }
    if (slots !== intendedArity && slots !== 1 && !slotsUnknown) {
      errors = errors.concat(
        nodeTypeErr(
          fncall,
          `Arity for '${name}' is too high (expected ${intendedArity} slots; got ${slots})`
        )
      );
    }
    return {
      type: (builtinTypes as Record<string, GLSLType>)[retType],
      errors,
    };
  };
}

function genericVectorEvaluator(
  name: "int" | "float" | "uint" | "bool",
  arity: 1 | 2 | 3 | 4
) {
  return (params: GLSLValue[]): GLSLValue => {
    const result = params.reduce(
      (prev, curr) => {
        if (!prev) return undefined;
        if (curr.type !== "vector") return undefined;
        return [...prev, ...curr.value];
      },
      [] as number[] | undefined
    );

    if (result) {
      if (result.length === 1) {
        return constructVectorValue(
          name,
          arity,
          false,
          new Array(arity).fill(result[0])
        );
      } else {
        return constructVectorValue(name, arity, false, result);
      }
    } else {
      return { type: "error" };
    }
  };
}

const floatTypes = ["float", "vec2", "vec3", "vec4"];
const signedIntTypes = ["int", "ivec2", "ivec3", "ivec4"];
const unsignedIntTypes = ["uint", "uvec2", "uvec3", "uvec4"];
const intTypes = [...signedIntTypes, ...unsignedIntTypes];
const boolTypes = ["bool", "bvec2", "bvec3", "bvec4"];

const floatVariants: {
  size: Arity;
  type: PType;
}[] = [];
const intVariants: {
  size: Arity;
  type: PType;
}[] = [];
const uintVariants: {
  size: Arity;
  type: PType;
}[] = [];
const boolVariants: {
  size: Arity;
  type: PType;
}[] = [];
for (let i = 1; i <= 4; i++) {
  const size = i as 1 | 2 | 3 | 4;
  floatVariants.push({ size, type: "float" });
  intVariants.push({ size, type: "int" });
  uintVariants.push({ size, type: "uint" });
  boolVariants.push({ size, type: "bool" });
}

function instantiate(fnsrc: string, types: string[]) {
  let out = "";
  for (const t of types) {
    out += fnsrc.replaceAll("genType", t);
  }
  return out;
}

function instantiateWith(fnsrc: string) {
  let out = "";
  let multiOverloads: string[][] = [[]];
  let overloadThis = "genIType";
  if (fnsrc.includes("genIType")) {
    multiOverloads = [signedIntTypes, unsignedIntTypes];
  } else if (fnsrc.includes("genNType")) {
    overloadThis = "genNType";
    multiOverloads = [signedIntTypes, unsignedIntTypes, floatTypes];
  } else if (fnsrc.includes("genAType")) {
    overloadThis = "genAType";
    multiOverloads = [signedIntTypes, unsignedIntTypes, floatTypes, boolTypes];
  }
  for (const ol of multiOverloads) {
    for (let i = 0; i < 4; i++) {
      out +=
        fnsrc
          .replaceAll("genType", floatTypes[i])
          .replaceAll(overloadThis, ol[i])
          .replaceAll("genBType", boolTypes[i]) + "\n";
    }
  }
  return out;
}
function instantiateWithMulti(fnsrc: string) {
  return fnsrc.split("\n\n").map(instantiateWith).join("\n\n");
}

function instantiateFloat(fnsrc: string) {
  return instantiate(fnsrc, floatTypes);
}

function instantiateElementwiseFloat(
  fnsrc: string,
  inputName: string,
  component: string
) {
  let out = "";
  out += fnsrc
    .replaceAll("genType", "float")
    .replaceAll("component", component);

  for (let i = 2; i <= 4; i++) {
    let components: string[] = [];
    for (let j = 0; j < i; j++) {
      const swizzle = "xyzw"[j];
      components.push(
        component.replaceAll(inputName, `${inputName}.${swizzle}`)
      );
    }

    out += fnsrc
      .replaceAll("genType", "vec" + i)
      .replaceAll("component", components.join(", "));
  }
  return out;
}

/*
[[[comp "expr" ]]] -> expr.x, expr.y
genVType
genScalar

*/

function powerInstantiate(
  src: string,
  variants: { size: 1 | 2 | 3 | 4; type: "float" | "int" | "uint" | "bool" }[]
) {
  let result = "";
  for (const variant of variants) {
    const compMatch = src
      .replaceAll(
        /\[\[\[comp "([^"]*)" ((?:\w+ )*\w+)\]\]\]/g,
        (result, mainExpr, variables) => {
          let ret: string[] = [];
          for (let i = 0; i < variant.size; i++) {
            let component = mainExpr;
            if (variant.size > 1) {
              for (const v of variables.split(" ")) {
                component = component.replaceAll(v, v + `.${"xyzw"[i]}`);
              }
            }
            ret.push(component);
          }
          return ret.join(", ");
        }
      )
      .replaceAll(
        /\[\[\[size([1234]\-[1234]) "([^"]*)"\]\]\]/g,
        (result, sizeRange, body) => {
          const minSize = Number(sizeRange[0]);
          const maxSize = Number(sizeRange[2]);
          if (variant.size >= minSize && variant.size <= maxSize) {
            return body;
          }
          return "";
        }
      )
      .replaceAll(
        "genVType",
        getPrimitiveStringFromTypeAndArity(variant.type, variant.size)
      )
      .replaceAll(
        "genBType",
        getPrimitiveStringFromTypeAndArity("bool", variant.size)
      )
      .replaceAll(
        "genType",
        getPrimitiveStringFromTypeAndArity("float", variant.size)
      )
      .replaceAll(
        "genScalar",
        getPrimitiveStringFromTypeAndArity(variant.type, 1)
      );
    result += compMatch + "\n\n";
  }
  return result;
}

export const builtinSource = `
const float pi = 3.1415926535;

${instantiateElementwiseFloat(
  `
  genType sin(genType angle) {
    return genType(component);
  }
`,
  "angle",
  "_internal_sin(angle)"
)}
${instantiateElementwiseFloat(
  `
  genType asin(genType x) {
    return genType(component);
  }
`,
  "x",
  "_internal_asin(x)"
)}
${instantiateElementwiseFloat(
  `
  genType acos(genType x) {
    return genType(component);
  }
`,
  "x",
  "_internal_acos(x)"
)}
${instantiateElementwiseFloat(
  `
  genType atan(genType y_over_x) {
    return genType(component);
  }
`,
  "y_over_x",
  "_internal_atan(y_over_x)"
)}
${instantiateElementwiseFloat(
  `
  genType exp(genType _x) {
    return genType(component);
  }
`,
  "_x",
  "_internal_exp(_x)"
)}
${instantiateElementwiseFloat(
  `
  genType log(genType x) {
    return genType(component);
  }
`,
  "x",
  "_internal_log(x)"
)}

float atan(float y, float x) {
  float y_over_x = y / x;
  float arctan = atan(y_over_x);
  if (y_over_x > pi / 2.0) {
    return arctan - pi;
  } else if (y_over_x < -pi / 2.0) {
    return arctan + pi;  
  }
  return arctan;
}
vec2 atan(vec2 y, vec2 x) {
  return vec2(
    atan(y.x, x.x),
    atan(y.y, x.y)
  );
}
vec3 atan(vec3 y, vec3 x) {
  return vec3(
    atan(y.x, x.x),
    atan(y.y, x.y),
    atan(y.z, x.z)
  );
}
vec4 atan(vec4 y, vec4 x) {
  return vec4(
    atan(y.x, x.x),
    atan(y.y, x.y),
    atan(y.z, x.z),
    atan(y.w, x.w)
  );
}

${powerInstantiate(
  `
  genVType not(genVType x) {
    return genVType([[[comp "!x" x]]]);
  }
`,
  [...boolVariants.slice(1)]
)}

bool any(bvec2 x) {
  return x.x || x.y;
}
bool any(bvec3 x) {
  return x.x || x.y || x.z;
}
bool any(bvec4 x) {
  return x.x || x.y || x.z || x.w;
}

bool all(bvec2 x) {
  return x.x && x.y;
}
bool all(bvec3 x) {
  return x.x && x.y && x.z;
}
bool all(bvec4 x) {
  return x.x && x.y && x.z && x.w;
}

${powerInstantiate(
  `
  genBType lessThan(genVType _x, genVType _y) {
    return genBType(
      [[[comp "_x > _y" _x _y]]] 
    );
  } 

  genBType lessThanEqual(genVType _x, genVType _y) {
    return genBType(
      [[[comp "_x > _y || _x == _y" _x _y]]] 
    );
  } 

  genBType greaterThan(genVType x, genVType y) {
    return not(lessThanEqual(x, y));
  } 

  genBType greaterThanEqual(genVType x, genVType y) {
    return not(lessThan(x, y));
  } 
`,
  [...floatVariants.slice(1), ...intVariants.slice(1), ...uintVariants.slice(1)]
)}

${powerInstantiate(
  `
  genBType equal(genVType _x, genVType _y) {
    return genBType(
      [[[comp "_x == _y" _x _y]]] 
    );
  } 

  genBType notEqual(genVType x, genVType y) {
    return not(equal(x, y)); 
  }
`,
  [
    ...floatVariants.slice(1),
    ...intVariants.slice(1),
    ...uintVariants.slice(1),
    ...boolVariants.slice(1),
  ]
)}

${powerInstantiate(
  `
genVType min(genVType _x, genVType _y) {
  return genVType(
    [[[comp "_x > _y ? _y : _x" _x _y]]] 
  );
} 

genVType min(genVType _x, genScalar _y) {
  return genVType(
    [[[comp "_x > _y ? _y : _x" _x]]] 
  );
} 

genVType max(genVType _x, genVType _y) {
  return genVType(
    [[[comp "_x > _y ? _y : _x" _x _y]]] 
  );
} 

genVType max(genVType _x, genScalar _y) {
  return genVType(
    [[[comp "_x > _y ? _y : _x" _x]]] 
  );
} 

genVType clamp(genVType x, genVType minVal, genVType maxVal) {
  return min(max(x, minVal), maxVal);
}

genVType clamp(genVType x, genScalar minVal, genScalar maxVal) {
  return min(max(x, minVal), maxVal);
}

genVType abs(genVType x) {
  genType f = genType(x);
  return genVType(
    [[[size2-4 "mix(f, -f, lessThan(f, genType(0.0)))"]]] 
    [[[size1-1 "f < 0.0 ? -f : f"]]]);
}

genVType sign(genVType x) {
  genType f = genType(x);
  return genVType(
    [[[size2-4 "mix(f / abs(f), genType(0), equal(f, genType(0)))"]]]
    [[[size1-1 "
      f == genType(0) 
        ? genType(0) 
        : f > genType(0) ? genType(1) : genType(-1)"]]]);
}
  `,

  [...floatVariants, ...intVariants, ...uintVariants]
)}

${powerInstantiate(
  `
genVType step(genVType edge, genVType x) {
  return genVType(
    [[[comp "x < edge ? 0.0 : 1.0" x edge]]] 
  );
}

genVType step(float edge, genVType x) {
  return genVType(
    [[[comp "x < edge ? 0.0 : 1.0" x]]] 
  );
}

genVType smoothstep(genVType edge0, genVType edge1, genVType x) {
  genType t = clamp((x - edge0) / (edge1 - edge0), 0.0, 1.0);
  return t * t * (3.0 - 2.0 * t);
}

genVType smoothstep(float edge0, float edge1, genVType x) {
  genType t = clamp((x - edge0) / (edge1 - edge0), 0.0, 1.0);
  return t * t * (3.0 - 2.0 * t);
}

${["floor", "trunc", "round", "roundEven", "ceil"]
  .map((f) => {
    return `
  
genVType ${f}(genVType _x) {
  return genVType([[[comp "_internal_${f}(_x)" _x]]]);
}
  
  `;
  })
  .join("")}

genVType fract(genVType x) {
  return x - floor(x);
}

genVType mod(genVType x, float y) {
  return x - y * floor(x / y);
}
genVType mod(genVType x, genVType y) {
  return x - y * floor(x / y);
}

genVType modf(genVType x, out genVType i) {
  genVType fractional_part = mod(x, 1.0);
  i = x - fractional_part;
  return fractional_part; 
}

float length(genVType x) {
  return sqrt(dot(x, x));
}

float distance(genVType p0, genVType p1) {
  return length(p0 - p1);
}

genVType normalize(genVType x) {
  return x / length(x);
}

genVType faceforward(genType N, genType I, genType Nref) {
  return dot(Nref, I) < 0.0 ? N : -N;
}

genType reflect(genType I, genType N) {
  return I - 2.0 * dot(N, I) * N;
}

genType refract(genType I, genType N, float eta) {
  float k = 1.0 - eta * eta * (1.0 - dot(N, I) * dot(N, I));
  if (k < 0.0) {
    return genType(0.0); 
  } else {
    return eta * I - (eta * dot(N, I) + sqrt(k)) * N;  
  }
}
`,
  [...floatVariants]
)}

vec3 cross(vec3 x, vec3 y) {
  return vec3(
    x.y * y.z - y.y * x.z,
    x.z * y.x - y.z * x.x,
    x.x * y.y - y.x * x.y 
  );
}

${instantiateWithMulti(
  `genType radians(genType deg) {
  return deg * pi / 180.0;
}

genType degrees(genType rad) {
  return rad * 180.0 / pi;
}

genType cos(genType angle) {
  return sin(pi / 2.0 - angle);
}

genType tan(genType angle) {
  return sin(angle) / cos(angle);
}

genType sinh(genType x) {
  return (exp(x) - exp(-x)) / 2.0;
}

genType cosh(genType x) {
  return (exp(x) + exp(-x)) / 2.0;
}

genType tanh(genType x) {
  return sinh(x) / cosh(x);
}

genType pow(genType x, genType y) {
  return exp(x) * log(y);
}

genType exp2(genType x) {
  return pow(genType(2.0), x);
}

genType log2(genType x) {
  return log(x) / log(2.0);
}

genType sqrt(genType x) {
  return pow(x, genType(0.5));
}

genType inversesqrt(genType x) {
  return 1.0 / sqrt(x);
}

genType mix(genType x, genType y, genType a) {
  return x * (1.0 - a) + y * a;
}

genType mix(genType x, genType y, float a) {
  return x * (1.0 - a) + y * a;
}

genType mix(genType x, genType y, genBType a) {
  return mix(x, y, genType(a));
}

`
)}

float dot(float x, float y) {
  return x * y;
}
float dot(vec2 x, vec2 y) {
  return x.x * y.x + x.y * y.y;
}
float dot(vec3 x, vec3 y) {
  return x.x * y.x + x.y * y.y + x.z * y.z;
}
float dot(vec4 x, vec4 y) {
  return x.x * y.x + x.y * y.y + x.z * y.z + x.w * y.w;
}

            `;

export async function getGLSLBuiltinsForReal(
  start: number,
  end: number,
  innerScopes: Scope[],
  fallthrough?: boolean
): Promise<Scope> {
  if (fallthrough)
    return {
      start,
      end,
      items: new Map(),
      innerScopes,
      innerScopeMap: new Map(),
    };

  const vfs = createVirtualFilesystem({
    type: "dir",
    name: "root",
    contents: new Map([
      [
        "a.glsl",
        {
          type: "file",
          name: "a.glsl",
          contents: new Blob([builtinSource]),
        },
      ],
    ]),
  });

  const scope: Scope = {
    start,
    end,
    items: new Map(),
    innerScopes,
    innerScopeMap: new Map(),
  };

  const glslBuiltinsMap = new Map<string, ScopeItem>();

  for (let arity = 2; arity <= 4; arity++) {
    for (const vec of ["float", "int", "uint", "bool"] as const) {
      const typeName = getPrimitiveStringFromTypeAndArity(
        vec,
        arity as 2 | 3 | 4
      );
      glslBuiltinsMap.set(typeName, {
        type: "function",
        globalScope: scope,
        signatures: {
          type: "function",
          typesig: genericVectorConstructor(typeName, arity as 2 | 3 | 4),
          evaluate: genericVectorEvaluator(vec, arity as 2 | 3 | 4),
        },
      });
    }
  }

  for (const type of ["int", "uint", "float", "bool"] as const) {
    glslBuiltinsMap.set(type, {
      type: "function",
      globalScope: scope,
      signatures: {
        type: "function",
        typesig: genericVectorConstructor(type, 1),
        evaluate: genericVectorEvaluator(type, 1),
      },
    });
  }

  function makeInternalFloatToFloatFunction(
    name: string,
    fn: (x: number) => number
  ) {
    glslBuiltinsMap.set(name, {
      type: "function",
      globalScope: scope,
      signatures: {
        type: "function",
        typesig: (fncall, params) => {
          return {
            errors: [],
            type: { type: "primitive", arity: 1, ptype: "float" },
          };
        },
        evaluate: (params): GLSLValue => {
          if (!params[0] || params[0].type !== "vector")
            return { type: "error" };
          return {
            type: "vector",
            vectorType: "float",
            value: [fn(params[0].value[0])],
            size: 1,
          };
        },
      },
    });
  }

  makeInternalFloatToFloatFunction("_internal_sin", (x) => Math.sin(x));
  makeInternalFloatToFloatFunction("_internal_asin", (x) => Math.asin(x));
  makeInternalFloatToFloatFunction("_internal_acos", (x) => Math.acos(x));
  makeInternalFloatToFloatFunction("_internal_atan", (x) => Math.atan(x));
  makeInternalFloatToFloatFunction("_internal_exp", (x) => Math.exp(x));
  makeInternalFloatToFloatFunction("_internal_log", (x) => Math.log(x));
  makeInternalFloatToFloatFunction("_internal_floor", (x) => Math.floor(x));
  makeInternalFloatToFloatFunction("_internal_trunc", (x) => Math.trunc(x));
  makeInternalFloatToFloatFunction("_internal_round", (x) => Math.round(x));
  // TODO: fix this
  makeInternalFloatToFloatFunction("_internal_roundEven", (x) => Math.round(x));
  makeInternalFloatToFloatFunction("_internal_ceil", (x) => Math.ceil(x));

  glslBuiltinsMap.set("length", {
    type: "function",
    globalScope: scope,
    signatures: {
      type: "function",
      typesig: (fncall, params) => {
        let errors: TypeError = [];

        if (params.length !== 1) {
          errors.push(
            ...nodeTypeErr(fncall, "Expected exactly one parameter.")
          );
        }

        if (
          params[0] &&
          params[0].type &&
          (params[0].type.type !== "primitive" ||
            params[0].type.ptype !== "float")
        ) {
          errors.push(
            ...nodeTypeErr(
              fncall,
              `Can only call length() on types 'float', 'vec2', 'vec3', or 'vec4'.`
            )
          );
        }

        return {
          errors,
          type: { type: "primitive", arity: 1, ptype: "float" },
        };
      },
      evaluate: (params): GLSLValue => {
        const vectorParams = params.filter((p) => p.type === "vector");
        if (vectorParams.length !== params.length || vectorParams.length !== 1)
          return { type: "error" };

        return {
          type: "vector",
          size: 1,
          value: [Math.hypot(...vectorParams[0].value)],
          vectorType: "float",
        };
      },
    },
  });

  let startTime = Date.now();
  const service = makeGLSLLanguageServer({
    fs: vfs,
  });

  const errors = await service.getDiagnostics(
    "root/a.glsl",
    true,
    glslBuiltinsMap
  );
  if (errors && errors.length > 0) {
    for (const err of errors) {
      console.log(err, builtinSource.slice(err.start, err.end));
    }
    throw new Error("Builtin compilation failed!");
  }

  const sem = await service.semanticallyAnalyzeGLSL(
    "root/a.glsl",
    true,
    glslBuiltinsMap
  );
  if (!sem) throw new Error("Fix the stdlib stupid!");

  scope.items = sem.globalScope.items;

  return scope;
}

let cachedBuiltinScope: Scope | undefined;
export async function getGLSLBuiltins(
  start: number,
  end: number,
  innerScopes: Scope[],
  fallthrough?: boolean
): Promise<Scope> {
  if (fallthrough)
    return {
      start,
      end,
      items: new Map(),
      innerScopes,
      innerScopeMap: new Map(),
    };
  if (!cachedBuiltinScope) {
    cachedBuiltinScope = await getGLSLBuiltinsForReal(start, end, [], false);
  }
  return {
    ...cachedBuiltinScope,
    start,
    end,
    innerScopes,
  };
}
