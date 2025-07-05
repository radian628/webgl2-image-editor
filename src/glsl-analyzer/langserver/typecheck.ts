import { err, ok, Result } from "../../utils/result";
import { makeFancyFormatter } from "../formatter/fmt-fancy";
import {
  AssignmentExpr,
  ASTNode,
  BinaryOpExpr,
  Commented,
  dummyNode,
  Expr,
  FullySpecifiedType,
  FunctionCallExpr,
  ParameterDeclaration,
  TypeNoPrec,
  TypeSpecifier,
} from "../parser";
import { getFunctionCallName, Scope, scopeFind } from "./glsl-language-server";
import {
  Arity,
  builtinTypes,
  convertType,
  getArity,
  getPType,
  GLSLType,
  isIntegralVector,
  isNumericalVector,
  isSameType,
  isScalar,
  stringifyType,
  TypeResult,
} from "./glsltype";
import { getSwizzleRegex } from "./validate-swizzle";

// export function isSameType( a: FullySpecifiedType | undefined,
//   b: FullySpecifiedType | undefined
// ): boolean {
//   if (!a || !b) return false;

//   const aspec = a.specifier.data.specifier.data;
//   const bspec = b.specifier.data.specifier.data;

//   if (
//     aspec.typeName.data.type === "struct" ||
//     bspec.typeName.data.type === "struct"
//   )
//     return false;

//   // TODO: check array sizes

//   return (
//     aspec.typeName.data.name.data === bspec.typeName.data.name.data &&
//     aspec.arrayType.type === bspec.arrayType.type
//   );
// }

function getTypeName(t: FullySpecifiedType | undefined): string | undefined {
  if (!t) return undefined;
  const spec = t.specifier.data.specifier.data;
  if (spec.typeName.data.type === "struct") return undefined;

  const name = spec.typeName.data.name.data;
  return name;
}

export function isFloatOrFloatVector(t: FullySpecifiedType | undefined) {
  const name = getTypeName(t);
  if (!name) return false;
  return ["float", "vec2", "vec3", "vec4"].includes(name);
}

export function isSignedIntOrIntVector(t: FullySpecifiedType | undefined) {
  const name = getTypeName(t);
  if (!name) return false;
  return ["int", "ivec2", "ivec3", "ivec4"].includes(name);
}

export function isUnsignedIntOrIntVector(t: FullySpecifiedType | undefined) {
  const name = getTypeName(t);
  if (!name) return false;
  return ["uint", "uvec2", "uvec3", "uvec4"].includes(name);
}

export function isBoolOrBoolVector(t: FullySpecifiedType | undefined) {
  const name = getTypeName(t);
  if (!name) return false;
  return ["bool", "bvec2", "bvec3", "bvec4"].includes(name);
}

// export function isScalar(t: FullySpecifiedType | undefined) {
//   const name = getTypeName(t);
//   if (!name) return false;
//   return ["float", "int", "uint", "bool"].includes(name);
// }

export function isIntOrIntVector(t: FullySpecifiedType | undefined) {
  return isSignedIntOrIntVector(t) || isUnsignedIntOrIntVector(t);
}

export function isNumberOrNumberVector(t: FullySpecifiedType | undefined) {
  return isIntOrIntVector(t) || isFloatOrFloatVector(t);
}

export function isPrimitiveOrPrimitiveVector(
  t: FullySpecifiedType | undefined
) {
  return isNumberOrNumberVector(t) || isBoolOrBoolVector(t);
}

export function getPrimitiveStringFromTypeAndArity(
  type: "float" | "int" | "uint" | "bool",
  arity: 1 | 2 | 3 | 4
) {
  return {
    float: {
      1: "float",
      2: "vec2",
      3: "vec3",
      4: "vec4",
    },
    int: {
      1: "int",
      2: "ivec2",
      3: "ivec3",
      4: "ivec4",
    },
    uint: {
      1: "uint",
      2: "uvec2",
      3: "uvec3",
      4: "uvec4",
    },
    bool: {
      1: "bool",
      2: "bvec2",
      3: "bvec3",
      4: "bvec4",
    },
  }[type][arity];
}

export function getPrimitiveFromTypeAndArity(
  type: "float" | "int" | "uint" | "bool",
  arity: 1 | 2 | 3 | 4
): FullySpecifiedType {
  const name = getPrimitiveStringFromTypeAndArity(type, arity);
  return builtinType(name);
}

export function isArrayType(t: FullySpecifiedType | undefined) {
  return t ? t?.specifier.data.specifier.data.arrayType.type !== "none" : false;
}

export function getTypePrimitiveCategory(
  t: FullySpecifiedType | undefined
): "float" | "int" | "uint" | "bool" | undefined {
  const name = getTypeName(t);
  if (!name) return;
  return (
    {
      float: "float",
      vec2: "float",
      vec3: "float",
      vec4: "float",
      int: "int",
      ivec2: "int",
      ivec3: "int",
      ivec4: "int",
      uint: "uint",
      uvec2: "uint",
      uvec3: "uint",
      uvec4: "uint",
      bool: "bool",
      bvec2: "bool",
      bvec3: "bool",
      bvec4: "bool",
    } as const
  )[name];
}

export function getTypePrimitiveArity(
  t: FullySpecifiedType | undefined
): 1 | 2 | 3 | 4 | undefined {
  const name = getTypeName(t);
  if (!name) return;
  return (
    {
      float: 1,
      vec2: 2,
      vec3: 3,
      vec4: 4,
      int: 1,
      ivec2: 2,
      ivec3: 3,
      ivec4: 4,
      uint: 1,
      uvec2: 2,
      uvec3: 3,
      uvec4: 4,
      bool: 1,
      bvec2: 2,
      bvec3: 3,
      bvec4: 4,
    } as const
  )[name];
}

export function builtinType(
  name: string,
  array?: TypeNoPrec["arrayType"]
): FullySpecifiedType {
  return {
    specifier: dummyNode({
      type: "type-specifier",
      specifier: dummyNode({
        arrayType: array ?? { type: "none" },
        typeName: dummyNode({
          type: "builtin",
          name: dummyNode(name),
        }),
      }),
    }),
  };
}

export type TypeError = {
  start: number;
  end: number;
  why: string;
}[];

export function nodeTypeErr(node: ASTNode<any>, why: string): TypeError {
  return [
    {
      start: node.range.start,
      end: node.range.end,
      why,
    },
  ];
}

export function getFunctionParamType(
  param: ParameterDeclaration
): FullySpecifiedType {
  if (param.declaratorOrSpecifier.type === "declarator") {
    return {
      specifier: param.declaratorOrSpecifier.declarator.data.typeSpecifier,
    };
  } else {
    return { specifier: param.declaratorOrSpecifier.specifier };
  }
}
export function getFunctionParamName(
  param: ParameterDeclaration
): string | undefined {
  if (param.declaratorOrSpecifier.type === "declarator") {
    return param.declaratorOrSpecifier.declarator.data.identifier.data;
  }
}

export function getFunctionParamTypeNode(
  param: ASTNode<ParameterDeclaration>
): Commented<FullySpecifiedType> {
  const range = param.range;
  if (param.data.declaratorOrSpecifier.type === "declarator") {
    return dummyNode(
      {
        specifier:
          param.data.declaratorOrSpecifier.declarator.data.typeSpecifier,
      },
      range
    );
  } else {
    return dummyNode(
      { specifier: param.data.declaratorOrSpecifier.specifier },
      range
    );
  }
}

export function unarrayType(type: FullySpecifiedType): FullySpecifiedType {
  const out = structuredClone(type);
  out.specifier.data.specifier.data.arrayType = { type: "none" };
  return out;
}

export function arrayifyType(
  type: FullySpecifiedType,
  size?: number
): FullySpecifiedType {
  const out = structuredClone(type);
  out.specifier.data.specifier.data.arrayType =
    size !== undefined
      ? {
          type: "static",
          size: dummyNode<Expr>({
            type: "int",
            int: size,
            asString: size.toString(),
            _isExpr: true,
            unsigned: true,
          }),
        }
      : {
          type: "dynamic",
        };
  return out;
}

type BinaryOpLikeExpression = BinaryOpExpr | AssignmentExpr;

const fmt = makeFancyFormatter(80, 2);

const errorForDifferentTypes = (
  errors: TypeError,
  typeLeft: TypeResult,
  typeRight: TypeResult,
  expr: ASTNode<BinaryOpLikeExpression>
) => {
  return {
    errors: errors.concat(
      nodeTypeErr(
        expr,
        `Types '${stringifyType(typeLeft.type!)}' and '${stringifyType(typeRight.type!)}' do not match. Types must match for operator '${(expr.data as BinaryOpLikeExpression).op}.'`
      )
    ),
  };
};

function errorForDifferentTypesIncludingBroadcasting(
  errors: TypeError,
  typeLeft: TypeResult,
  typeRight: TypeResult,
  expr: ASTNode<BinaryOpLikeExpression>
) {
  const leftCat = getPType(typeLeft.type);
  const rightCat = getPType(typeRight.type);

  const leftArity = getArity(typeLeft.type);
  const rightArity = getArity(typeRight.type);

  if (leftCat && rightCat && leftArity && rightArity && leftCat === rightCat) {
    if (leftArity === rightArity || leftArity === 1 || rightArity === 1) {
      return undefined;
    }
  }

  return {
    errors: errors.concat(
      nodeTypeErr(
        expr,
        `Types '${stringifyType(typeLeft.type!)}' and '${stringifyType(typeRight.type!)}' do not match. Types must either match exactly or be a vector-scalar pair for operator '${(expr.data as BinaryOpLikeExpression).op}.'`
      )
    ),
  };
}

// export function stringifyType(type: FullySpecifiedType) {
//   return fmt.fullySpecifiedType(dummyNode(type));
// }

function getBinOpLeftRightAndErrors(
  expr: ASTNode<BinaryOpLikeExpression>,
  scopeChain: Scope[]
) {
  const typeLeft = getExprType(expr.data.left, scopeChain);
  const typeRight = getExprType(expr.data.right, scopeChain);

  let errors: TypeError = typeLeft.errors.concat(typeRight.errors);
  return { typeLeft, typeRight, errors };
}

function errorForNonexistentBinOpTypes(
  typeLeft: TypeResult,
  typeRight: TypeResult,
  errors: TypeError,
  defaultTo: () => GLSLType | undefined,
  ifLeftExists?: () => GLSLType | undefined,
  ifRightExists?: () => GLSLType | undefined
) {
  if (!typeLeft.type && !typeRight.type) {
    return {
      errors,
    };
  } else if (typeLeft.type && !typeRight.type) {
    return {
      errors,
      type: ifLeftExists ? ifLeftExists() : defaultTo(),
    };
  } else if (!typeLeft.type && typeRight.type) {
    return {
      errors,
      type: ifRightExists ? ifRightExists() : defaultTo(),
    };
  }

  return undefined;
}

function getArithmeticExpressionType(
  expr: ASTNode<BinaryOpLikeExpression>,
  scopeChain: Scope[]
): TypeResult {
  const { typeLeft, typeRight, errors } = getBinOpLeftRightAndErrors(
    expr,
    scopeChain
  );

  const nonexistent = errorForNonexistentBinOpTypes(
    typeLeft,
    typeRight,
    errors,
    () => undefined,
    () => typeLeft.type,
    () => typeRight.type
  );
  if (nonexistent) return nonexistent;

  const isLeftNumerical = isNumericalVector(typeLeft.type);
  const isRightNumerical = isNumericalVector(typeRight.type);

  if (!isLeftNumerical || !isRightNumerical) {
    return {
      errors: errors
        .concat(
          isLeftNumerical
            ? []
            : nodeTypeErr(
                expr.data.left,
                `Type '${stringifyType(typeLeft.type!)}' cannot be applied to operation '${expr.data.op}'.`
              )
        )
        .concat(
          isRightNumerical
            ? []
            : nodeTypeErr(
                expr.data.right,
                `Type '${stringifyType(typeRight.type!)}' cannot be applied to operation '${expr.data.op}'.`
              )
        ),
    };
  }

  const difftypes = errorForDifferentTypesIncludingBroadcasting(
    errors,
    typeLeft,
    typeRight,
    expr
  );
  if (difftypes) return difftypes;

  return {
    errors,
    type: typeLeft.type,
  };
}

function getEqualityExpressionType(
  expr: ASTNode<BinaryOpLikeExpression>,
  scopeChain: Scope[]
): TypeResult {
  const { typeLeft, typeRight, errors } = getBinOpLeftRightAndErrors(
    expr,
    scopeChain
  );

  const nonexistent = errorForNonexistentBinOpTypes(
    typeLeft,
    typeRight,
    errors,
    () => builtinTypes.bool
  );
  if (nonexistent) return nonexistent;

  if (!isSameType(typeLeft.type, typeRight.type)) {
    return errorForDifferentTypes(errors, typeLeft, typeRight, expr);
  }

  return {
    errors,
    type: builtinTypes.bool,
  };
}

function getComparisonExpressionType(
  expr: ASTNode<BinaryOpLikeExpression>,
  scopeChain: Scope[]
): TypeResult {
  const { typeLeft, typeRight, errors } = getBinOpLeftRightAndErrors(
    expr,
    scopeChain
  );

  const nonexistent = errorForNonexistentBinOpTypes(
    typeLeft,
    typeRight,
    errors,
    () => builtinTypes.bool
  );
  if (nonexistent) return nonexistent;

  const isLeftScalar = isScalar(typeLeft.type);
  const isRightScalar = isScalar(typeRight.type);
  if (!isLeftScalar || !isRightScalar) {
    return {
      type: builtinTypes.bool,
      errors: errors
        .concat(
          isLeftScalar
            ? []
            : nodeTypeErr(
                expr.data.left,
                `Operator '${expr.data.op}' only supports scalar types (float, uint, int, and bool), but this expression is of type '${stringifyType(typeLeft.type!)}'. Vectors are not supported.`
              )
        )
        .concat(
          isLeftScalar
            ? []
            : nodeTypeErr(
                expr.data.right,
                `Operator '${expr.data.op}' only supports scalar types (float, uint, int, and bool), but this expression is of type '${stringifyType(typeRight.type!)}'. Vectors are not supported.`
              )
        ),
    };
  }

  return {
    errors,
    type: builtinTypes.bool,
  };
}

function getBitwiseExpressionType(
  expr: ASTNode<BinaryOpLikeExpression>,
  scopeChain: Scope[]
): TypeResult {
  const { typeLeft, typeRight, errors } = getBinOpLeftRightAndErrors(
    expr,
    scopeChain
  );

  const nonexistent = errorForNonexistentBinOpTypes(
    typeLeft,
    typeRight,
    errors,
    () => typeLeft.type ?? typeRight.type
  );
  if (nonexistent) return nonexistent;

  const isLeftIntegral = isIntegralVector(typeLeft.type);
  const isRightIntegral = isIntegralVector(typeRight.type);

  if (!isLeftIntegral || !isRightIntegral) {
    return {
      errors: errors
        .concat(
          isLeftIntegral
            ? []
            : nodeTypeErr(
                expr.data.left,
                `Type '${stringifyType(typeLeft.type!)}' cannot be applied to operation '${expr.data.op}'.`
              )
        )
        .concat(
          isRightIntegral
            ? []
            : nodeTypeErr(
                expr.data.right,
                `Type '${stringifyType(typeRight.type!)}' cannot be applied to operation '${expr.data.op}'.`
              )
        ),
    };
  }

  const difftypes = errorForDifferentTypesIncludingBroadcasting(
    errors,
    typeLeft,
    typeRight,
    expr
  );
  if (difftypes) return difftypes;

  return {
    errors,
    type: typeLeft.type,
  };
}

/// TODO: check for edge cases
const getModuloExpressionType = getBitwiseExpressionType;

function getBitshiftExpressionType(
  expr: ASTNode<BinaryOpLikeExpression>,
  scopeChain: Scope[]
): TypeResult {
  const { typeLeft, typeRight, errors } = getBinOpLeftRightAndErrors(
    expr,
    scopeChain
  );

  const nonexistent = errorForNonexistentBinOpTypes(
    typeLeft,
    typeRight,
    errors,
    () => typeLeft.type
  );
  if (nonexistent) return nonexistent;

  const isLeftIntegral = isIntegralVector(typeLeft.type);
  const isRightIntegral = isIntegralVector(typeRight.type);

  if (!isLeftIntegral || !isRightIntegral) {
    return {
      errors: errors
        .concat(
          isLeftIntegral
            ? []
            : nodeTypeErr(
                expr.data.left,
                `Type '${stringifyType(typeLeft.type!)}' cannot be applied to operation '${expr.data.op}'.`
              )
        )
        .concat(
          isRightIntegral
            ? []
            : nodeTypeErr(
                expr.data.right,
                `Type '${stringifyType(typeRight.type!)}' cannot be applied to operation '${expr.data.op}'.`
              )
        ),
      type: isLeftIntegral ? typeLeft.type : undefined,
    };
  }

  const difftypes = errorForDifferentTypesIncludingBroadcasting(
    errors,
    typeLeft,
    typeRight,
    expr
  );
  if (difftypes) return difftypes;

  return {
    errors,
    type: typeLeft.type,
  };
}

function getLogicalExpressionType(
  expr: ASTNode<BinaryOpLikeExpression>,
  scopeChain: Scope[]
): TypeResult {
  const { typeLeft, typeRight, errors } = getBinOpLeftRightAndErrors(
    expr,
    scopeChain
  );
  const nonexistent = errorForNonexistentBinOpTypes(
    typeLeft,
    typeRight,
    errors,
    () => builtinTypes.bool
  );
  if (nonexistent) return nonexistent;

  const isLeftBool = isSameType(typeLeft.type, builtinTypes.bool);
  const isRightBool = isSameType(typeRight.type, builtinTypes.bool);

  if (!isLeftBool || !isRightBool) {
    return {
      errors: errors
        .concat(
          isLeftBool
            ? []
            : nodeTypeErr(
                expr.data.left,
                `Type '${stringifyType(typeLeft.type!)}' cannot be applied to operation '${expr.data.op}'.`
              )
        )
        .concat(
          isRightBool
            ? []
            : nodeTypeErr(
                expr.data.right,
                `Type '${stringifyType(typeRight.type!)}' cannot be applied to operation '${expr.data.op}'.`
              )
        ),
      type: builtinTypes.bool,
    };
  }

  return {
    errors,
    type: builtinTypes.bool,
  };
}

function getCommaExpressionType(
  expr: ASTNode<BinaryOpLikeExpression>,
  scopeChain: Scope[]
): TypeResult {
  const { typeLeft, typeRight, errors } = getBinOpLeftRightAndErrors(
    expr,
    scopeChain
  );

  const nonexistent = errorForNonexistentBinOpTypes(
    typeLeft,
    typeRight,
    errors,
    () => typeRight.type
  );
  if (nonexistent) return nonexistent;

  return {
    errors,
    type: typeRight.type,
  };
}

function getArrayAccessExpressionType(
  expr: ASTNode<BinaryOpLikeExpression>,
  scopeChain: Scope[]
): TypeResult {
  const { typeLeft, typeRight, errors } = getBinOpLeftRightAndErrors(
    expr,
    scopeChain
  );

  const nonexistent = errorForNonexistentBinOpTypes(
    typeLeft,
    typeRight,
    errors,
    () => undefined
  );
  if (nonexistent) return nonexistent;

  if (typeLeft.type!.type !== "array" || isScalar(typeLeft.type)) {
    errors.push(
      ...nodeTypeErr(
        expr.data.left,
        `Received type '${stringifyType(typeLeft.type!)}', expected an array or a vector.`
      )
    );
    return {
      errors,
    };
  }

  if (!isIntegralVector(typeRight.type)) {
    errors.push(
      ...nodeTypeErr(
        expr.data.right,
        `Received type '${stringifyType(typeRight.type!)}', expected an integer.`
      )
    );
  }

  if (isScalar(typeRight.type)) {
    errors.push(
      ...nodeTypeErr(
        expr.data.right,
        `Received type '${stringifyType(typeRight.type!)}', expected a scalar integer.`
      )
    );
  }

  return {
    errors,
    type: typeLeft.type?.elementType,
  };
}

export function getExprType(
  expr: ASTNode<Expr>,
  scopeChain: Scope[]
): TypeResult {
  switch (expr.data.type) {
    case "int":
      return {
        type: expr.data.unsigned ? builtinTypes.uint : builtinTypes.int,
        errors: [],
      };
    case "float":
      return { type: builtinTypes.float, errors: [] };
    case "bool":
      return { type: builtinTypes.bool, errors: [] };
    case "function-call":
      const fnName = getFunctionCallName(expr.data);
      const paramTypes = expr.data.args.map((a) => getExprType(a, scopeChain));
      const paramErrors: TypeError = paramTypes.flatMap((p) => p.errors);
      const fn = scopeFind(scopeChain, fnName);
      const fexpr = expr as ASTNode<FunctionCallExpr>;
      if (!fn)
        return {
          errors: nodeTypeErr(
            expr,
            `Function '${fnName}' does not exist.`
          ).concat(paramErrors),
        };
      if (fn.type !== "function")
        return {
          errors: nodeTypeErr(
            expr,
            `'${fnName}' exists, but is not a function.`
          ).concat(paramErrors),
        };

      if (
        expr.data.identifier.type === "type-specifier" &&
        expr.data.identifier.specifier.data.arrayType.type !== "none"
      ) {
        const arrayType = expr.data.identifier.specifier.data.arrayType;

        const fst: FullySpecifiedType = {
          specifier: dummyNode<TypeSpecifier>({
            type: "type-specifier",
            specifier: expr.data.identifier.specifier,
          }),
        };
        const fullArrayType: TypeResult = convertType(
          fst,
          scopeChain,
          arrayType.type === "dynamic"
            ? {
                type: "num",
                size: expr.data.args.length,
              }
            : undefined
        );

        if (!fullArrayType.type || fullArrayType.type.type !== "array")
          return fullArrayType;

        const elemtype = fullArrayType.type.elementType;

        if (fullArrayType.type.size !== paramTypes.length) {
          paramErrors.push(
            ...nodeTypeErr(
              expr,
              `
            Array constructor for type '${stringifyType(fullArrayType.type)}' requires exactly ${fullArrayType.type.size} arguments, but ${paramTypes.length} were provided.
            `
            )
          );
        }

        const parameterWrongTypeErrors = paramTypes.flatMap((e, i) =>
          paramTypes[i].type
            ? isSameType(paramTypes[i].type, elemtype)
              ? []
              : nodeTypeErr(
                  fexpr.data.args[i],
                  `Argument of type '${stringifyType(paramTypes[i].type)}' is not assignable to type '${stringifyType(elemtype)}'.`
                )
            : []
        );

        // TODO: properly handle sized arrays
        if (arrayType.type === "static") {
          return {
            type: fullArrayType.type,
            errors: paramErrors.concat(
              parameterWrongTypeErrors.concat(paramErrors)
            ),
          };
        } else {
          return {
            type: fullArrayType.type,
            errors: paramErrors.concat(
              parameterWrongTypeErrors.concat(paramErrors)
            ),
          };
        }
      } else {
        if (fn.signatures.type === "list") {
          for (const sig of fn.signatures.list) {
            const params = sig.fndef.data.prototype.data.parameters?.data ?? [];
            if (paramTypes.length !== params.length) continue;
            let matches = true;
            for (let i = 0; i < params.length; i++) {
              const suppliedType = paramTypes[i];
              const paramType = convertType(
                getFunctionParamType(params[i].data),
                scopeChain
              );
              if (
                suppliedType.type &&
                !isSameType(suppliedType.type, paramType.type)
              ) {
                matches = false;
              }
            }

            if (matches) {
              const converted = convertType(
                sig.fndef.data.prototype.data.fullySpecifiedType.data,
                scopeChain
              );
              return {
                type: converted.type,
                errors: paramErrors.concat(converted.errors),
              };
            }
          }
        } else {
          const retType = fn.signatures.typesig(
            fexpr,
            paramTypes.map((t, i) => ({
              expr: fexpr.data.args[i],
              type: t.type,
            }))
          );
          return {
            errors: paramErrors.concat(retType.errors),
            type: retType.type,
          };
        }
      }

      return {
        errors: nodeTypeErr(
          expr,
          `No matching overload '${fnName}(${paramTypes.map((t) => (t.type ? stringifyType(t.type) : "unknown")).join(", ")})' found.`
        ).concat(paramErrors),
      };
    case "ident":
      const name = expr.data.ident;
      const defn = scopeFind(scopeChain, name);
      if (!defn) {
        return {
          errors: nodeTypeErr(expr, `'${name}' does not exist.`),
        };
      } else if (defn.type === "function") {
        return {
          errors: nodeTypeErr(
            expr,
            `'${name}' exists, but it is a function, not a variable.`
          ),
        };
      }
      return convertType(defn.dataType.data, scopeChain);
    case "binary-op":
      const bexpr = expr as ASTNode<BinaryOpExpr>;
      switch (expr.data.op) {
        case "+":
        case "-":
        case "*":
        case "/":
          return getArithmeticExpressionType(bexpr, scopeChain);
        case "==":
        case "!=":
          return getEqualityExpressionType(bexpr, scopeChain);
        case ">":
        case ">=":
        case "<":
        case "<=":
          return getComparisonExpressionType(bexpr, scopeChain);
        case "&":
        case "^":
        case "|":
          return getBitwiseExpressionType(bexpr, scopeChain);
        case "%":
          return getModuloExpressionType(bexpr, scopeChain);
        case "<<":
        case ">>":
          return getBitshiftExpressionType(bexpr, scopeChain);
        case "&&":
        case "^^":
        case "||":
          return getLogicalExpressionType(bexpr, scopeChain);
        case ",":
          return getCommaExpressionType(bexpr, scopeChain);
        case "[]":
          return getArrayAccessExpressionType(bexpr, scopeChain);
      }
    case "assignment":
      const aexpr = expr as ASTNode<AssignmentExpr>;
      switch (expr.data.op) {
        case "+=":
        case "-=":
        case "*=":
        case "/=":
          return getArithmeticExpressionType(aexpr, scopeChain);
        case "&=":
        case "^=":
        case "|=":
          return getBitwiseExpressionType(aexpr, scopeChain);
        case "%=":
          return getModuloExpressionType(aexpr, scopeChain);
        case "<<=":
        case ">>=":
          return getBitshiftExpressionType(aexpr, scopeChain);
        case "=": {
          const { errors, typeLeft, typeRight } = getBinOpLeftRightAndErrors(
            aexpr,
            scopeChain
          );

          const nonexistent = errorForNonexistentBinOpTypes(
            typeLeft,
            typeRight,
            errors,
            () => typeLeft.type ?? typeRight.type
          );
          if (nonexistent) return nonexistent;

          if (isSameType(typeLeft.type, typeRight.type)) {
            return {
              type: typeLeft.type,
              errors,
            };
          } else {
            return {
              type: typeLeft.type,
              errors: errors.concat(
                nodeTypeErr(
                  expr,
                  `Expression '${fmt.exprmax(expr.data.left)}' is of type '${stringifyType(
                    typeLeft.type!
                  )}'`
                )
              ),
            };
          }
        }
      }
    case "conditional": {
      let errors: TypeError = [];
      const condType = getExprType(expr.data.condition, scopeChain);
      const ifTrueType = getExprType(expr.data.ifTrue, scopeChain);
      const ifFalseType = getExprType(expr.data.ifFalse, scopeChain);

      errors.push(
        ...condType.errors,
        ...ifTrueType.errors,
        ...ifFalseType.errors
      );

      if (condType.type) {
        const isConditionBoolean = isSameType(condType.type, builtinTypes.bool);
        if (!isConditionBoolean) {
          errors = errors.concat(
            nodeTypeErr(
              expr.data.condition,
              `This expression is of type '${stringifyType(
                condType.type
              )}', which cannot be used as a condition, as a condition needs to be a boolean.`
            )
          );
        }
      }

      if (
        ifTrueType.type &&
        ifFalseType.type &&
        !isSameType(ifTrueType.type, ifFalseType.type)
      ) {
        errors = errors.concat(
          nodeTypeErr(
            expr,
            `Both branches of a conditional must be the same type. However, these branches are of type '${stringifyType(ifTrueType.type)}' and '${stringifyType(ifFalseType.type)}'`
          )
        );
      }

      return {
        errors,
        type: ifTrueType.type ?? ifFalseType.type,
      };
    }
    case "error":
      return {
        errors: [
          {
            why: expr.data.why,
            start: expr.range.start,
            end: expr.range.end,
          },
        ],
      };
    case "unary-op":
      const operandType = getExprType(expr.data.left, scopeChain);
      if (!operandType.type) {
        return {
          errors: operandType.errors,
        };
      }
      switch (expr.data.op) {
        case "++":
        case "--":
          if (!isNumericalVector(operandType.type)) {
            return {
              errors: operandType.errors.concat(
                nodeTypeErr(
                  expr,
                  `Operator '${expr.data.op}' requires a numerical type; the supplied type was '${stringifyType(operandType.type)}'.`
                )
              ),
            };
          }

          return {
            errors: operandType.errors,
            type: operandType.type,
          };
        case "!": {
          let errors = operandType.errors.concat();
          if (!isSameType(operandType.type, builtinTypes.bool)) {
            errors = errors.concat(
              nodeTypeErr(
                expr,
                `Operator '${expr.data.op}' requires a boolean operand; the suppllied type was '${stringifyType(operandType.type)}'.`
              )
            );
          }
          return {
            errors: operandType.errors,
            type: builtinTypes.bool,
          };
        }
        case "~":
          let errors = operandType.errors.concat();
          if (!isIntegralVector(operandType.type)) {
            errors = errors.concat(
              nodeTypeErr(
                expr,
                `Operator '${expr.data.op}' requires an integer or integer vector operand; the suppllied type was '${stringifyType(operandType.type)}'.`
              )
            );
          }
          return {
            errors: operandType.errors,
            type: builtinTypes.bool,
          };
      }
    case "field-access": {
      const operandType = getExprType(expr.data.left, scopeChain);
      let errors = operandType.errors.concat();

      if (!operandType.type) {
        return {
          errors,
        };
      }

      const baseType = getPType(operandType.type);

      if (baseType) {
        const arity = getArity(operandType.type)!;

        if (arity === 1) {
          errors = errors.concat(
            nodeTypeErr(
              expr,
              `You cannot access the fields of this, as it is of type '${stringifyType(operandType.type)}', which has no fields.`
            )
          );
          return {
            errors,
          };
        }

        // TODO: handle structs and methods properly

        const allowedSwizzles = getSwizzleRegex(arity);

        if (expr.data.right.type === "function") {
          errors = errors.concat(
            nodeTypeErr(
              expr,
              `Type '${stringifyType(operandType.type)}' has no methods.`
            )
          );
        } else {
          // swizzle
          const fieldname = expr.data.right.variable.data;
          const swizzleMatch = fieldname.match(allowedSwizzles)?.[0];
          if (swizzleMatch && swizzleMatch.length === fieldname.length) {
            // const retType = getPrimitiveFromTypeAndArity(
            //   baseType,
            //   swizzleMatch.length as 1 | 2 | 3 | 4
            // );

            return {
              errors,
              type: {
                type: "primitive",
                ptype: baseType,
                arity: swizzleMatch.length as Arity,
              },
            };
          } else {
            errors = errors.concat(
              nodeTypeErr(
                expr,
                `Field '${fieldname}' does not exist on type '${stringifyType(operandType.type)}'.`
              )
            );
          }
        }

        return {
          errors,
        };
      }

      return {
        errors,
      };
    }
  }
}
