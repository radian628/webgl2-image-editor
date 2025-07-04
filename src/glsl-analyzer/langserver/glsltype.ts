import { ASTNode, Expr, FullySpecifiedType } from "../parser";
import { evaluateExpression } from "./evaluator";
import { Scope } from "./glsl-language-server";
import {
  getExprType,
  getTypePrimitiveArity,
  getTypePrimitiveCategory,
  nodeTypeErr,
  unarrayType,
} from "./typecheck";
import { TypeError } from "./typecheck";

export type PType = "int" | "uint" | "bool" | "float";
export type Arity = 1 | 2 | 3 | 4;

export type GLSLType =
  | {
      type: "primitive";
      arity: Arity;
      ptype: PType;
    }
  | {
      type: "array";
      elementType: GLSLType;
      size: number;
    }
  | {
      type: "struct";
      name: string;
    };

const pr = (arity: Arity, ptype: PType): GLSLType => ({
  type: "primitive",
  arity,
  ptype,
});

export const builtinTypes = {
  int: pr(1, "int"),
  float: pr(1, "float"),
  uint: pr(1, "uint"),
  bool: pr(1, "bool"),
  vec2: pr(2, "float"),
  ivec2: pr(2, "int"),
  uvec2: pr(2, "uint"),
  bvec2: pr(2, "bool"),
  vec3: pr(3, "float"),
  ivec3: pr(3, "int"),
  uvec3: pr(3, "uint"),
  bvec3: pr(3, "bool"),
  vec4: pr(4, "float"),
  ivec4: pr(4, "int"),
  uvec4: pr(4, "uint"),
  bvec4: pr(4, "bool"),
} satisfies Record<string, GLSLType>;

export function isSameType(
  a: GLSLType | undefined,
  b: GLSLType | undefined
): boolean {
  if (!a || !b) return false;

  if (a.type === "primitive" && b.type === "primitive") {
    return a.arity === b.arity && a.ptype === b.ptype;
  }

  if (a.type === "array" && b.type === "array") {
    return a.size === b.size && isSameType(a.elementType, b.elementType);
  }

  if (a.type === "struct" && b.type === "struct") {
    return a.name === b.name;
  }

  return false;
}

export function stringifyType(type: GLSLType): string {
  // TODO: fix this
  if (type.type === "primitive") {
    if (type.arity === 1) {
      return type.ptype;
    } else {
      return (type.ptype === "float" ? "" : type.ptype[0]) + "vec" + type.arity;
    }
  } else if (type.type === "array") {
    return stringifyType(type.elementType) + `[${type.size}]`;
  } else {
    return type.name;
  }
}

export function matchesPrimitiveTypes<P extends PType, A extends Arity>(
  type: GLSLType | undefined,
  ptypes?: P[],
  arities?: A[]
): type is { type: "primitive"; ptype: P; arity: A } {
  if (!type || type.type !== "primitive") {
    return false;
  }

  return (
    (ptypes ? (ptypes as PType[]).includes(type.ptype) : true) &&
    (arities ? (arities as Arity[]).includes(type.arity) : true)
  );
}

export function isInt(type: GLSLType | undefined) {
  return matchesPrimitiveTypes(type, ["int"]);
}

export function isUint(type: GLSLType | undefined) {
  return matchesPrimitiveTypes(type, ["uint"]);
}

export function isNumericalVector(type: GLSLType | undefined) {
  return matchesPrimitiveTypes(type, ["int", "uint", "float"]);
}

export function isScalar(type: GLSLType | undefined) {
  return matchesPrimitiveTypes(type, undefined, [1]);
}

export function isIntegralVector(type: GLSLType | undefined) {
  return matchesPrimitiveTypes(type, ["int", "uint"]);
}

export function getArity(type: GLSLType | undefined): Arity | undefined {
  if (!type) return;
  if (!matchesPrimitiveTypes(type)) return;
  return type.arity;
}

export function getPType(type: GLSLType | undefined): PType | undefined {
  if (!type) return;
  if (!matchesPrimitiveTypes(type)) return;
  return type.ptype;
}

export type TypeResult = {
  type?: GLSLType;
  errors: TypeError;
};

function getTypeName(type: FullySpecifiedType) {
  const typeName = type.specifier.data.specifier.data.typeName;
  if (typeName.data.type === "struct") {
    return typeName.data.struct.data.name?.data;
  }
  return typeName.data.name.data;
}

function getExpressionType(expr: ASTNode<Expr>, scopes: Scope[]): TypeResult {
  return getExprType(expr, scopes);
}

// TODO: handle matrices and samplers and the like
export function convertType(
  type: FullySpecifiedType,
  scopes: Scope[],
  unsizedArrayInitializer?:
    | { type: "expr"; expr: ASTNode<Expr> }
    | { type: "num"; size: number }
): TypeResult {
  const arrayType = type.specifier.data.specifier.data.arrayType;
  if (arrayType.type === "none") {
    const typename = getTypeName(type);
    if (!typename)
      return {
        // TODO: fix this and add proper struct support
        errors: nodeTypeErr(type.specifier, "no"),
      };
    const arity = getTypePrimitiveArity(type);
    const cat = getTypePrimitiveCategory(type);
    if (!arity || !cat)
      return {
        errors: nodeTypeErr(type.specifier, "no"),
      };

    return {
      type: {
        type: "primitive",
        arity,
        ptype: cat,
      },
      errors: [],
    };
  } else {
    const unarray = unarrayType(type);

    const elemtype = convertType(unarray, scopes);

    if (!elemtype.type) return elemtype;

    let arraySize: number;

    if (arrayType.type === "dynamic") {
      if (!unsizedArrayInitializer) {
        return {
          errors: nodeTypeErr(
            type.specifier,
            "Arrays with no specified size must be initialized."
          ),
        };
      } else {
        if (unsizedArrayInitializer.type === "expr") {
          const exprtype = getExpressionType(
            unsizedArrayInitializer.expr,
            scopes
          );
          if (!exprtype.type || exprtype.type.type !== "array") {
            return {
              errors: exprtype.errors,
            };
          }
          arraySize = exprtype.type.size;
        } else {
          arraySize = unsizedArrayInitializer.size;
        }
      }
    } else {
      // TODO: handle other const variables
      const sizetype = getExpressionType(arrayType.size, scopes);
      if (!sizetype.type) return sizetype;
      if (!isInt(sizetype.type) && !isUint(sizetype.type)) {
        return {
          errors: sizetype.errors.concat(
            nodeTypeErr(
              type.specifier,
              `Array size must be of type 'int' or 'uint' (received '${stringifyType(sizetype.type)}').`
            )
          ),
        };
      }

      const result = evaluateExpression(arrayType.size, [
        {
          correspondingScopes: scopes,
          values: new Map(),
        },
      ]);

      if (
        result.type !== "vector" ||
        result.size !== 1 ||
        !["int", "uint"].includes(result.vectorType)
      ) {
        return {
          errors: sizetype.errors.concat(
            nodeTypeErr(
              type.specifier,
              "INTERNAL ERROR: Constant evaluator produced the wrong type!"
            )
          ),
        };
      }

      arraySize = result.value[0];
    }

    // TODO: handle arrays of arrays
    return {
      type: {
        type: "array",
        elementType: elemtype.type,
        size: arraySize,
      },
      errors: [],
    };
  }
}
