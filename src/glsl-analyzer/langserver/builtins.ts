import { typeNameToGLPrimitive } from "../../components/iframe-runtime/GLMessageProtocol";
import {
  ASTNode,
  Commented,
  dummyNode,
  Expr,
  FullySpecifiedType,
  function_call_header,
  function_prototype,
  FunctionCallExpr,
  FunctionHeader,
  ParameterDeclaration,
} from "../parser";
import { lexGLSL, tryParseGLSLRaw } from "../parser-combined";
import { constructVectorValue, GLSLValue } from "./evaluator";
import { Scope, ScopeItem } from "./glsl-language-server";
import {
  builtinTypes,
  getArity,
  GLSLType,
  stringifyType,
  TypeResult,
} from "./glsltype";
import {
  builtinType,
  getPrimitiveStringFromTypeAndArity,
  getTypePrimitiveArity,
  getTypePrimitiveCategory,
  isArrayType,
  nodeTypeErr,
  TypeError,
} from "./typecheck";

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

let glslBuiltinsMap = new Map<string, ScopeItem>();

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

for (let arity = 2; arity <= 4; arity++) {
  for (const vec of ["float", "int", "uint", "bool"] as const) {
    const typeName = getPrimitiveStringFromTypeAndArity(
      vec,
      arity as 2 | 3 | 4
    );
    glslBuiltinsMap.set(typeName, {
      type: "function",
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
    signatures: {
      type: "function",
      typesig: genericVectorConstructor(type, 1),
      evaluate: genericVectorEvaluator(type, 1),
    },
  });
}

export const glslBuiltinScope = (start: number, end: number): Scope => ({
  start,
  end,
  items: glslBuiltinsMap,
  innerScopes: [],
  innerScopeMap: new Map(),
});
