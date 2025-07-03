import { err, ok, Result } from "../../utils/result";
import { makeFancyFormatter } from "../formatter/fmt-fancy";
import {
  AssignmentExpr,
  ASTNode,
  BinaryOpExpr,
  dummyNode,
  Expr,
  FullySpecifiedType,
  TypeNoPrec,
} from "../parser";
import { getFunctionCallName, Scope, scopeFind } from "./glsl-language-server";

function isSameType(
  a: FullySpecifiedType | undefined,
  b: FullySpecifiedType | undefined
): boolean {
  if (!a || !b) return false;

  const aspec = a.specifier.data.specifier.data;
  const bspec = b.specifier.data.specifier.data;

  if (
    aspec.typeName.data.type === "struct" ||
    bspec.typeName.data.type === "struct"
  )
    return false;

  return aspec.typeName.data.name.data === bspec.typeName.data.name.data;
}

function getTypeName(t: FullySpecifiedType | undefined): string | undefined {
  if (!t) return undefined;
  const spec = t.specifier.data.specifier.data;
  if (spec.typeName.data.type === "struct") return undefined;

  const name = spec.typeName.data.name.data;
  return name;
}

function isFloatOrFloatVector(t: FullySpecifiedType | undefined) {
  const name = getTypeName(t);
  if (!name) return false;
  return ["float", "vec2", "vec3", "vec4"].includes(name);
}

function isSignedIntOrIntVector(t: FullySpecifiedType | undefined) {
  const name = getTypeName(t);
  if (!name) return false;
  return ["int", "ivec2", "ivec3", "ivec4"].includes(name);
}

function isUnsignedIntOrIntVector(t: FullySpecifiedType | undefined) {
  const name = getTypeName(t);
  if (!name) return false;
  return ["uint", "uvec2", "uvec3", "uvec4"].includes(name);
}

function isBoolOrBoolVector(t: FullySpecifiedType | undefined) {
  const name = getTypeName(t);
  if (!name) return false;
  return ["bool", "bvec2", "bvec3", "bvec4"].includes(name);
}

function isScalar(t: FullySpecifiedType | undefined) {
  const name = getTypeName(t);
  if (!name) return false;
  return ["float", "int", "uint", "bool"].includes(name);
}

function isIntOrIntVector(t: FullySpecifiedType | undefined) {
  return isSignedIntOrIntVector(t) || isUnsignedIntOrIntVector(t);
}

function isNumberOrNumberVector(t: FullySpecifiedType | undefined) {
  return isIntOrIntVector(t) || isFloatOrFloatVector(t);
}

function isPrimitiveOrPrimitiveVector(t: FullySpecifiedType | undefined) {
  return isNumberOrNumberVector(t) || isBoolOrBoolVector(t);
}

function getTypePrimitiveCategory(
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

function getTypePrimitiveArity(
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

function builtinType(
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

type TypeError = {
  start: number;
  end: number;
  why: string;
}[];

function nodeTypeErr(node: ASTNode<any>, why: string): TypeError {
  return [
    {
      start: node.range.start,
      end: node.range.end,
      why,
    },
  ];
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
  const leftCat = getTypePrimitiveCategory(typeLeft.type);
  const rightCat = getTypePrimitiveCategory(typeRight.type);

  const leftArity = getTypePrimitiveArity(typeLeft.type);
  const rightArity = getTypePrimitiveArity(typeRight.type);

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

function stringifyType(type: FullySpecifiedType) {
  return fmt.fullySpecifiedType(dummyNode(type));
}

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
  defaultTo: () => FullySpecifiedType | undefined,
  ifLeftExists?: () => FullySpecifiedType | undefined,
  ifRightExists?: () => FullySpecifiedType | undefined
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

// TODO: handle broadcasting (e.g. vec4 + float)
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

  const isLeftNumerical = isNumberOrNumberVector(typeLeft.type);
  const isRightNumerical = isNumberOrNumberVector(typeRight.type);

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
    () => builtinType("bool")
  );
  if (nonexistent) return nonexistent;

  if (!isSameType(typeLeft.type, typeRight.type)) {
    return errorForDifferentTypes(errors, typeLeft, typeRight, expr);
  }

  return {
    errors,
    type: builtinType("bool"),
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
    () => builtinType("bool")
  );
  if (nonexistent) return nonexistent;

  const isLeftScalar = !isScalar(typeLeft.type);
  const isRightScalar = !isScalar(typeRight.type);
  if (!isLeftScalar || !isRightScalar) {
    return {
      type: builtinType("bool"),
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
    type: builtinType("bool"),
  };
}

function getBitwiseExpressionType(
  expr: ASTNode<BinaryOpLikeExpression>,
  scopeChain: Scope[]
) {
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

  const isLeftIntegral = isIntOrIntVector(typeLeft.type);
  const isRightIntegral = isIntOrIntVector(typeRight.type);

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
) {
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

  const isLeftIntegral = isIntOrIntVector(typeLeft.type);
  const isRightIntegral = isIntOrIntVector(typeRight.type);

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
) {
  const { typeLeft, typeRight, errors } = getBinOpLeftRightAndErrors(
    expr,
    scopeChain
  );
  const nonexistent = errorForNonexistentBinOpTypes(
    typeLeft,
    typeRight,
    errors,
    () => builtinType("bool")
  );
  if (nonexistent) return nonexistent;

  const isLeftBool = isSameType(typeLeft.type, builtinType("bool"));
  const isRightBool = isSameType(typeRight.type, builtinType("bool"));

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
      type: builtinType("bool"),
    };
  }

  return {
    errors,
    type: builtinType("bool"),
  };
}

function getCommaExpressionType(
  expr: ASTNode<BinaryOpLikeExpression>,
  scopeChain: Scope[]
) {
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
) {
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

  if (
    typeLeft.type?.specifier.data.specifier.data.arrayType.type === "none" ||
    getTypePrimitiveArity(typeLeft.type) === 1
  ) {
    errors.push(
      ...nodeTypeErr(
        expr.data.left,
        `Received type '${stringifyType(typeLeft.type!)}', expected an array or a vector.`
      )
    );
  }

  if (!isIntOrIntVector(typeRight.type)) {
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
    type: builtinType(getTypeName(typeLeft.type) ?? "unknown"),
  };
}

export type TypeResult = {
  type?: FullySpecifiedType;
  errors: TypeError;
};

export function getExprType(
  expr: ASTNode<Expr>,
  scopeChain: Scope[]
): TypeResult {
  switch (expr.data.type) {
    case "int":
      return { type: builtinType("int"), errors: [] };
    case "float":
      return { type: builtinType("float"), errors: [] };
    case "bool":
      return { type: builtinType("bool"), errors: [] };
    case "function-call":
      const fnName = getFunctionCallName(expr.data);
      const paramTypes = expr.data.args.map((a) => getExprType(a, scopeChain));
      const paramErrors = paramTypes.flatMap((p) => p.errors);
      const fn = scopeFind(scopeChain, fnName);
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
      return { type: fn.signature.data.fullySpecifiedType.data, errors: [] };
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
      return {
        type: defn.dataType.data,
        errors: [],
      };
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
      // TODO: revamp the typechecker functions to tell you the correct operator
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
                  `Expression '${fmt.exprmax(expr.data.left)}' is of type '${fmt.fullySpecifiedType(
                    dummyNode(typeLeft.type!)
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
        const isConditionBoolean = isSameType(
          condType.type,
          builtinType("bool")
        );
        if (!isConditionBoolean) {
          errors.concat(
            nodeTypeErr(
              expr.data.condition,
              `This expression is of type '${stringifyType(
                condType.type
              )}', which canot be used as a condition, as a condition needs to be a boolean.`
            )
          );
        }
      }

      if (
        ifTrueType.type &&
        ifFalseType.type &&
        isSameType(ifTrueType.type, ifFalseType.type)
      ) {
        errors = errors.concat(
          nodeTypeErr(
            expr.data.condition,
            `Both branches of a conditional must be the same type. However, these branches are of type '${stringifyType(ifTrueType.type)}' and ${stringifyType(ifFalseType.type)}`
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
          if (!isNumberOrNumberVector(operandType.type)) {
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
          if (!isSameType(operandType.type, builtinType("boolean"))) {
            errors = errors.concat(
              nodeTypeErr(
                expr,
                `Operator '${expr.data.op}' requires a boolean operand; the suppllied type was '${stringifyType(operandType.type)}'.`
              )
            );
          }
          return {
            errors: operandType.errors,
            type: builtinType("boolean"),
          };
        }
        case "~":
          let errors = operandType.errors.concat();
          if (!isIntOrIntVector(operandType.type)) {
            errors = errors.concat(
              nodeTypeErr(
                expr,
                `Operator '${expr.data.op}' requires an integer or integer vector operand; the suppllied type was '${stringifyType(operandType.type)}'.`
              )
            );
          }
          return {
            errors: operandType.errors,
            type: builtinType("boolean"),
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

      const baseType = getTypePrimitiveCategory(operandType.type);

      if (baseType) {
        const arity = getTypePrimitiveArity(operandType.type)!;

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

        const allowedSwizzles = {
          2: /[xy]{1,2}|[rg]{1,2}|[st]{1,2}/,
          3: /[xyz]{1,3}|[rgb]{1,3}|[stp]{1,3}/,
          4: /[xyzw]{1,4}|[rgba]{1,4}|[stpq]{1,4}/,
        }[arity];

        const swizzleMatch = expr.data.right;

        errors = errors.concat(nodeTypeErr(expr, ``));
      }
    }
  }

  // TODO: finish this
  return {
    errors: [],
  };
}
