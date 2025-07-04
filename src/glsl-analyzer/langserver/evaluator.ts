import {
  ASTNode,
  BinaryOpExpr,
  Commented,
  Declaration,
  Expr,
  FieldAccessExpr,
  FullySpecifiedType,
  Stmt,
  TranslationUnit,
  UnaryOpExpr,
  VariableExpr,
} from "../parser";
import { getScopeOf, Scope, scopeFind } from "./glsl-language-server";
import {
  arrayifyType,
  getPrimitiveFromTypeAndArity,
  getPrimitiveStringFromTypeAndArity,
  getTypePrimitiveArity,
  getTypePrimitiveCategory,
  unarrayType,
} from "./typecheck";
import {
  getSwizzleRegex,
  lValueSwizzles,
  swizzleCharToIndex,
} from "./validate-swizzle";

type GLSLValue =
  | {
      type: "vector";
      vectorType: "int" | "float" | "uint" | "bool";
      size: 1 | 2 | 3 | 4;
      value: number[];
    }
  | {
      type: "array";
      value: GLSLValue[];
    }
  | {
      type: "struct";
      structType: string;
      fields: Map<string, GLSLValue>;
    }
  | {
      // errors are handled by the typechecker; we don't care about them here.
      type: "error";
    }
  | { type: "uninitialized"; intendedType: FullySpecifiedType };

function areValuesSameType(a: GLSLValue, b: GLSLValue): boolean {
  if (a.type === "vector" && b.type === "vector") {
    return a.vectorType === b.vectorType && a.size === b.size;
  } else if (a.type === "array" && b.type === "array") {
    return (
      a.value.length === b.value.length &&
      a.value.every((v, i) => areValuesSameType(v, b.value[i]))
    );
  } else if (a.type === "struct" && b.type === "struct") {
    return a.structType === b.structType;
  }
  return false;
}

function doesValueMatchType(val: GLSLValue, type: FullySpecifiedType): boolean {
  if (val.type === "error" || val.type === "uninitialized") return false;
  const arrayType = type.specifier.data.specifier.data.arrayType;
  const typeName =
    type.specifier.data.specifier.data.typeName.data.type === "struct"
      ? type.specifier.data.specifier.data.typeName.data.struct.data.name?.data
      : type.specifier.data.specifier.data.typeName.data.name.data;

  const category = getTypePrimitiveCategory(type);
  const arity = getTypePrimitiveArity(type);
  if (arrayType.type === "none") {
    if (val.type === "array") return false;

    if (val.type === "vector") {
      const prim = getPrimitiveStringFromTypeAndArity(val.vectorType, val.size);
      return prim === typeName;
    } else if (val.type === "struct") {
      return typeName === val.structType;
    }
  } else {
    if (val.type !== "array") return false;
    const unarrayed = unarrayType(type);
    return val.value.every((v) => doesValueMatchType(v, unarrayed));
  }

  return false;
}

function areValuesEqual(a: GLSLValue, b: GLSLValue): boolean {
  if (!areValuesSameType(a, b)) return false;

  if (a.type === "vector" && b.type === "vector")
    return a.value.every((av, i) => av == b.value[i]);

  if (a.type === "array" && b.type === "array")
    return a.value.every((av, i) => areValuesEqual(av, b.value[i]));

  if (a.type === "struct" && b.type === "struct")
    return [...a.fields].every(([k, v]) =>
      b.fields.has(k) ? areValuesEqual(v, b.fields.get(k)!) : false
    );

  return false;
}

function vec(
  vectorType: "int" | "float" | "uint" | "bool",
  size: 1 | 2 | 3 | 4,
  isConst: boolean,
  value: number[]
): GLSLValue {
  return {
    type: "vector",
    vectorType,
    size,
    value,
  };
}

const error: GLSLValue = {
  type: "error",
};

export type StackFrame = {
  correspondingScopes: Scope[];
  values: Map<
    string,
    | {
        // optional in case value is uninitialized
        value: GLSLValue;
        type: FullySpecifiedType;
      }
    | undefined
  >;
};

function stackFind(
  stack: StackFrame[],
  name: string
): { value?: GLSLValue; type: FullySpecifiedType } | undefined {
  if (stack.length === 0) {
    return;
  } else {
    return (
      stack.at(-1)!.values.get(name) ?? stackFind(stack.slice(0, -1), name)
    );
  }
}

function stackSet(
  stack: StackFrame[],
  name: string,
  value: (val?: GLSLValue) => GLSLValue
): GLSLValue {
  if (stack.length === 0) {
    return error;
  } else {
    const lastFrame = stack.at(-1)!;
    const currentValue = lastFrame.values.get(name);
    if (currentValue) {
      const newvalue = value(currentValue.value);
      if (doesValueMatchType(newvalue, currentValue.type)) {
        lastFrame.values.set(name, {
          value: newvalue,
          type: currentValue.type,
        });
        return newvalue;
      } else {
        lastFrame.values.set(name, {
          type: currentValue.type,
          value: { type: "error" },
        });
        return error;
      }
    } else {
      return stackSet(stack.slice(0, -1), name, value);
    }
  }
}

export function isConst(expr: ASTNode<Expr>, scopeChain: Scope[]): boolean {
  const ic = (expr: ASTNode<Expr>) => isConst(expr, scopeChain);
  switch (expr.data.type) {
    case "float":
    case "int":
    case "bool":
      return true;
    case "error":
    case "assignment":
      return false;
    case "binary-op":
      if (expr.data.op === ",") return false;
      return ic(expr.data.left) && ic(expr.data.right);
    case "conditional":
      return (
        ic(expr.data.ifFalse) && ic(expr.data.ifTrue) && ic(expr.data.condition)
      );
    case "field-access":
      if (expr.data.right.type === "variable") {
        return ic(expr.data.left);
      } else {
        return ic(expr.data.left) && ic(expr.data.right.function);
      }
    case "function-call": {
      const arraySizeConst =
        expr.data.identifier.type === "type-specifier"
          ? expr.data.identifier.specifier.data.arrayType.type === "static"
            ? ic(expr.data.identifier.specifier.data.arrayType.size)
            : true
          : true;

      // TODO: don't mark user-created functions as const
      return arraySizeConst && expr.data.args.every((e) => ic(e));
    }
    case "unary-op":
      return ic(expr.data.left);
    case "ident":
      const result = getScopeOf(scopeChain, expr.data.ident);
      if (!result) return false;
      const { item, scope } = result;
      if (item.type === "function") return false;
      return (
        item.dataType.data.qualifier?.data.storageQualifier?.data === "const"
      );
  }
}

export function isLValue(expr: ASTNode<Expr>, scopeChain: Scope[]): boolean {
  switch (expr.data.type) {
    case "ident":
      const item = scopeFind(scopeChain, expr.data.ident);
      return item?.type === "variable" && !isConst(expr, scopeChain);
    case "field-access":
      return (
        isLValue(expr.data.left, scopeChain) &&
        expr.data.right.type === "variable"
      );
    case "conditional":
      // TODO: make more permissive (allow rvalues in nonevaluated branch)
      return (
        isConst(expr.data.condition, scopeChain) &&
        isLValue(expr.data.ifTrue, scopeChain) &&
        isLValue(expr.data.ifFalse, scopeChain)
      );
    case "binary-op":
      return expr.data.op === "[]";
  }
  return false;
}

function applyToVec(
  value: GLSLValue,
  vectypes: string[],
  fn: (n: number) => number,
  arities?: number[]
) {
  if (
    value.type === "vector" &&
    vectypes.includes(value.vectorType) &&
    (!arities || arities.includes(value.size))
  ) {
    return {
      ...value,
      value: value.value.map(fn),
    };
  }
  return error;
}

type PrimitiveCategory = "float" | "int" | "uint" | "bool";

function applyToVecPair(
  a: GLSLValue,
  b: GLSLValue,
  mutuallyValidVecTypes: string[][],
  fn: (a: number, b: number) => number,
  newtype: (t1: PrimitiveCategory, t2: PrimitiveCategory) => PrimitiveCategory,
  broadcast: boolean
): GLSLValue {
  // this only works on vectors
  if (a.type !== "vector" || b.type !== "vector") return error;

  // eliminate type mismatches
  let foundMatch = false;
  for (const validVecTypes of mutuallyValidVecTypes) {
    if (
      validVecTypes.includes(a.vectorType) &&
      validVecTypes.includes(b.vectorType)
    ) {
      foundMatch = true;
    }
  }
  if (!foundMatch) return error;

  // vector size mismatch
  if (a.size !== b.size && !(broadcast && (a.size === 1 || b.size === 1)))
    return error;

  const biggerSize = Math.max(a.size, b.size);

  // broadcasting
  if (a.size !== b.size) {
    return {
      type: "vector",
      vectorType: newtype(a.vectorType, b.vectorType),
      size: biggerSize as 1 | 2 | 3 | 4,
      value:
        a.size > b.size
          ? a.value.map((av) => fn(av, b.value[0]))
          : b.value.map((bv) => fn(a.value[0], bv)),
    };

    // same size
  } else {
    return {
      type: "vector",
      vectorType: newtype(a.vectorType, b.vectorType),
      size: biggerSize as 1 | 2 | 3 | 4,
      value: a.value.map((av, i) => fn(av, b.value[i])),
    };
  }
}

const arithmeticMutuals = [["float"], ["int"], ["uint"]];

function add(a: GLSLValue, b: GLSLValue) {
  return applyToVecPair(
    a,
    b,
    arithmeticMutuals,
    (a, b) => a + b,
    (a, b) => a,
    true
  );
}

function subtract(a: GLSLValue, b: GLSLValue) {
  return applyToVecPair(
    a,
    b,
    arithmeticMutuals,
    (a, b) => a - b,
    (a, b) => a,
    true
  );
}

function multiply(a: GLSLValue, b: GLSLValue) {
  return applyToVecPair(
    a,
    b,
    arithmeticMutuals,
    (a, b) => a * b,
    (a, b) => a,
    true
  );
}

function divide(a: GLSLValue, b: GLSLValue) {
  return applyToVecPair(
    a,
    b,
    arithmeticMutuals,
    (a, b) => Number(BigInt(a) / BigInt(b)),
    (a, b) => a,
    true
  );
}

function modulo(a: GLSLValue, b: GLSLValue) {
  return applyToVecPair(
    a,
    b,
    [["int"], ["uint"]],
    (a, b) => a % b,
    (a, b) => a,
    true
  );
}

function logical(
  a: GLSLValue,
  b: GLSLValue,
  op: (a: boolean, b: boolean) => boolean
) {
  if (
    a.type !== "vector" ||
    b.type !== "vector" ||
    a.size !== 1 ||
    b.size !== 1 ||
    a.vectorType !== "bool" ||
    b.vectorType !== "bool"
  )
    return error;
  return vec("bool", 1, false, [op(!!a.value[0], !!b.value[0]) ? 1 : 0]);
}

function comparison(
  a: GLSLValue,
  b: GLSLValue,
  op: (a: number, b: number) => boolean
) {
  if (
    a.type !== "vector" ||
    b.type !== "vector" ||
    a.size !== 1 ||
    b.size !== 1 ||
    a.vectorType === "bool" ||
    b.vectorType === "bool" ||
    !areValuesSameType(a, b)
  )
    return error;

  return vec("bool", 1, false, [op(a.value[0], b.value[0]) ? 1 : 0]);
}

function equality(
  a: GLSLValue,
  b: GLSLValue,
  op: (a: GLSLValue, b: GLSLValue) => boolean
) {
  if (!areValuesSameType(a, b)) return error;

  return vec("bool", 1, false, [op(a, b) ? 1 : 0]);
}

function bitwise(
  a: GLSLValue,
  b: GLSLValue,
  fn: (a: number, b: number) => number
) {
  return applyToVecPair(a, b, [["int"], ["uint"]], fn, (a, b) => a, true);
}

function bitshift(
  a: GLSLValue,
  b: GLSLValue,
  fn: (a: number, b: number) => number
) {
  return applyToVecPair(a, b, [["int", "uint"]], fn, (a, b) => a, true);
}

export function assignToLValue(
  lvalue: ASTNode<Expr>,
  stack: StackFrame[],
  assign: (oldvalue: GLSLValue, newvalue: GLSLValue) => GLSLValue,
  newvalue: GLSLValue
): GLSLValue {
  switch (lvalue.data.type) {
    case "ident":
      const iexpr = lvalue as ASTNode<VariableExpr>;
      return stackSet(stack, iexpr.data.ident, (v) =>
        assign(v ?? error, newvalue)
      );
    case "binary-op":
      if (lvalue.data.op !== "[]") return error;
      const index = evaluateExpression(lvalue.data.right, stack);
      if (
        index.type !== "vector" ||
        !["int", "uint"].includes(index.vectorType) ||
        index.size !== 1 ||
        Math.floor(index.value[0]) !== index.value[0]
      ) {
        return error;
      }

      const indexNum = index.value[0];

      return assignToLValue(
        lvalue.data.left,
        stack,
        (lv, nv) => {
          if (
            lv.type === "array" &&
            lv.value.length > indexNum &&
            indexNum >= 0
          ) {
            return {
              ...lv,
              value: lv.value.map((e, i) =>
                i === indexNum ? assign(e, nv) : e
              ),
            };
          } else {
            return error;
          }
        },
        newvalue
      );
    case "field-access":
      const fa = lvalue as ASTNode<FieldAccessExpr>;
      return assignToLValue(
        lvalue.data.left,
        stack,
        (lv, nv) => {
          // swizzling
          if (lv.type === "vector") {
            if (lv.size === 1) return error;
            const swizzle = fa.data.right;
            if (swizzle.type === "function") return error;
            const isValidSwizzle = lValueSwizzles[lv.size].has(
              swizzle.variable.data
            );
            if (!isValidSwizzle) return error;

            if (
              nv.type !== "vector" ||
              nv.vectorType !== lv.vectorType ||
              nv.size !== swizzle.variable.data.length
            )
              return error;

            const lvcopy = structuredClone(lv);

            let i = 0;
            for (const c of swizzle.variable.data) {
              lvcopy.value[swizzleCharToIndex(c)!] = nv.value[i];
              i++;
            }

            return lvcopy;
          } else {
            return error;
          }
        },
        newvalue
      );
    // TODO: structs
    case "conditional":
      if (!isConst(lvalue.data.condition, stack.at(-1)!.correspondingScopes))
        return error;
      const cond = evalexpr(lvalue.data.condition, stack);
      if (
        cond.type !== "vector" ||
        cond.size !== 1 ||
        cond.vectorType !== "bool"
      )
        return error;
      return assignToLValue(
        cond.value[0] === 1 ? lvalue.data.ifTrue : lvalue.data.ifFalse,
        stack,
        (lv, nv) => {
          return assign(lv, nv);
        },
        newvalue
      );
  }
  return error;
}

export function evaluateExpression(
  expr: ASTNode<Expr>,
  stack: StackFrame[]
): GLSLValue {
  switch (expr.data.type) {
    case "float":
      return vec("float", 1, true, [expr.data.float]);
    case "int":
      return vec(expr.data.unsigned ? "uint" : "int", 1, true, [expr.data.int]);
    case "error":
      return error;
    case "ident":
      return stackFind(stack, expr.data.ident)?.value ?? error;
    case "bool":
      return vec("bool", 1, true, [expr.data.bool ? 1 : 0]);
    case "conditional": {
      const cond = evalexpr(expr.data.condition, stack);
      if (
        cond.type !== "vector" ||
        cond.vectorType !== "bool" ||
        cond.size !== 1
      )
        return error;
      if (cond.value[0] === 1) {
        return evalexpr(expr.data.ifTrue, stack);
      } else {
        return evalexpr(expr.data.ifFalse, stack);
      }
    }
    case "assignment":
      if (!isLValue(expr.data.left, stack.at(-1)!.correspondingScopes))
        return error;
      const newValue = evalexpr(expr.data.right, stack);
      const op = expr.data.op;
      return assignToLValue(
        expr.data.left,
        stack,
        (ov, nv) => {
          switch (op) {
            case "+=":
              return add(ov, nv);
            case "-=":
              return subtract(ov, nv);
            case "*=":
              return multiply(ov, nv);
            case "/=":
              return divide(ov, nv);
            case "%=":
              return modulo(ov, nv);
            case "&=":
              return bitwise(ov, nv, (a, b) => a & b);
            case "|=":
              return bitwise(ov, nv, (a, b) => a | b);
            case "^=":
              return bitwise(ov, nv, (a, b) => a ^ b);
            case "<<=":
              return bitshift(ov, nv, (a, b) => a << b);
            case ">>=":
              return bitshift(ov, nv, (a, b) => a >> b);
            case "=":
              return nv;
          }
        },
        newValue
      );
    case "unary-op": {
      const uexpr = expr as ASTNode<UnaryOpExpr>;

      const incdec = (offset: number) =>
        assignToLValue(
          uexpr.data.left,
          stack,
          (ov, nv) => {
            if (ov.type !== "vector") return error;
            return add(ov, vec(ov.vectorType, 1, false, [1]));
          },
          error
        );

      switch (uexpr.data.op) {
        case "++":
        case "--":
          const offset = expr.data.op === "++" ? 1 : -1;
          if (!isLValue(expr, stack.at(-1)!.correspondingScopes)) return error;
          const prevValue = evalexpr(expr, stack);
          const postValue = incdec(offset);

          return uexpr.data.isAfter ? prevValue : postValue;
        case "~":
          return applyToVec(
            evalexpr(expr.data.left, stack),
            ["int", "uint"],
            (c) => ~c
          );
        case "!":
          return applyToVec(
            evalexpr(expr.data.left, stack),
            ["bool"],
            (c) => 1 - c,
            [1]
          );
      }
    }
    case "binary-op":
      const bexpr = expr as ASTNode<BinaryOpExpr>;
      const a = evalexpr(expr.data.left, stack);
      const b = evalexpr(expr.data.right, stack);
      switch (bexpr.data.op) {
        case "+":
          return add(a, b);
        case "-":
          return subtract(a, b);
        case "*":
          return multiply(a, b);
        case "/":
          return divide(a, b);
        case "%":
          return modulo(a, b);
        case "<<":
          return bitshift(a, b, (a, b) => a << b);
        case ">>":
          return bitshift(a, b, (a, b) => a >> b);
        case "&":
          return bitwise(a, b, (a, b) => a & b);
        case "|":
          return bitwise(a, b, (a, b) => a | b);
        case "^":
          return bitwise(a, b, (a, b) => a ^ b);
        case ",":
          return b;
        case "&&":
          return logical(a, b, (a, b) => a && b);
        case "||":
          return logical(a, b, (a, b) => a || b);
        case "^^":
          return logical(a, b, (a, b) => (a || b) && !(a && b));
        case ">=":
          return comparison(a, b, (a, b) => a >= b);
        case "<=":
          return comparison(a, b, (a, b) => a <= b);
        case ">":
          return comparison(a, b, (a, b) => a > b);
        case "<":
          return comparison(a, b, (a, b) => a < b);
        case "==":
          return equality(a, b, (a, b) => areValuesEqual(a, b));
        case "!=":
          return equality(a, b, (a, b) => !areValuesEqual(a, b));
        case "[]":
          if (a.type !== "array") return error;
          if (
            b.type !== "vector" ||
            b.size !== 1 ||
            !["int", "uint"].includes(b.vectorType)
          )
            return error;
          return a.value[b.value[0]] ?? error;
      }
    case "field-access": {
      const a = evalexpr(expr.data.left, stack);

      if (a.type === "vector") {
        // TODO: support swizzles
      } else if (a.type === "array") {
        // TODO: support array length
      } else if (a.type === "struct") {
        // TODO: support structs
      }

      return error;
    }
    case "function-call":
      // TODO: support function calls
      return error;
  }
}

export function evalexpr(expr: ASTNode<Expr>, stack: StackFrame[]): GLSLValue {
  const val = evaluateExpression(expr, stack);
  return val;
}

function stackWithNewFrame(stack: StackFrame[], stmt: ASTNode<any>) {
  const lastFrame = stack.at(-1)!;
  const lastScope = lastFrame.correspondingScopes.at(-1)!;

  const stmtScope = lastScope.innerScopeMap.get(stmt);
  if (!stmtScope) {
    throw new Error(
      "Statement should have a scope!!! This error should never be thrown."
    );
  }

  const newScopes = [...lastFrame.correspondingScopes, stmtScope];
  const newStack: StackFrame[] = [
    ...stack,
    {
      correspondingScopes: [...lastFrame.correspondingScopes, stmtScope],
      values: new Map(),
    },
  ];

  return newStack;
}

type EvaluateStatementResult = {
  returnValue?: GLSLValue;
  shouldReturn?: boolean;
  shouldBreak?: boolean;
  shouldContinue?: boolean;
  caseResult?: GLSLValue;
  execNext?: ASTNode<Stmt>[];
  defaultCase?: boolean;
  discard?: boolean;
};

function evaluateDecl(decl: Commented<Declaration>, stack: StackFrame[]) {
  switch (decl.data.type) {
    case "declarator-list":
      if (decl.data.declaratorList.data.init.data.type === "invariant")
        return {};
      const currentStackFrame = stack.at(-1)!;
      for (const variable of decl.data.declaratorList.data.declarations.data) {
        const name = variable.data.name.data;
        const datatype = decl.data.declaratorList.data.init.data.declType.data;
        const arrayType = datatype.specifier.data.specifier.data.arrayType;
        if (!variable.data.variant) {
          // TODO: properly initialize structs
          if (arrayType.type === "none") {
            currentStackFrame.values.set(name, {
              type: datatype,
              value: { type: "uninitialized", intendedType: datatype },
            });

            // static arrays
          } else if (arrayType.type === "static") {
            const count = evalexpr(arrayType.size, stack);
            currentStackFrame.values.set(name, {
              type: datatype,
              value:
                count.type === "vector" &&
                count.size === 1 &&
                (count.vectorType === "int" || count.vectorType === "uint")
                  ? {
                      type: "array",
                      value: new Array(count.value[0]).map((e, i) => ({
                        type: "uninitialized",
                        intendedType: unarrayType(datatype),
                      })),
                    }
                  : error,
            });

            // can't have uninitialized sized arrays
          } else {
            currentStackFrame.values.set(name, {
              value: { type: "error" },
              type: datatype,
            });
          }
        } else {
          // TODO: fix arrays of arrays issue
          const variant = variable.data.variant.data;
          if (variant.type === "initialized") {
            currentStackFrame.values.set(name, {
              type: datatype,
              // TODO: typecheck this later
              value: evalexpr(variant.initializer, stack),
            });
          } else if (variant.type === "sized-array") {
            const count = evalexpr(variant.size, stack);
            currentStackFrame.values.set(name, {
              type: datatype,
              // TODO: typecheck this later
              value:
                count.type === "vector" &&
                count.size === 1 &&
                (count.vectorType === "int" || count.vectorType === "uint")
                  ? {
                      type: "array",
                      value: new Array(count.value[0]).map((e, i) => ({
                        type: "uninitialized",
                        intendedType: unarrayType(datatype),
                      })),
                    }
                  : error,
            });
          } else if (variant.type === "initialized-array") {
            const initvalue = evalexpr(variant.initializer, stack);
            if (initvalue.type !== "array") {
              currentStackFrame.values.set(name, {
                type: arrayifyType(datatype),
                value: error,
              });
            } else {
              currentStackFrame.values.set(name, {
                type: arrayifyType(datatype, initvalue.value.length),
                value: initvalue,
              });
            }
          }
        }
      }
  }
}

export function evaluateStatement(
  stmt: ASTNode<Stmt>,
  stack: StackFrame[]
): EvaluateStatementResult {
  switch (stmt.data.type) {
    case "return":
      return {
        returnValue: stmt.data.expr
          ? evalexpr(stmt.data.expr, stack)
          : undefined,
        shouldReturn: true,
      };
    case "break":
      return { shouldBreak: true };
    case "case":
      return {
        caseResult: evalexpr(stmt.data.expr, stack),
      };
    case "compound":
      const newstack = stackWithNewFrame(stack, stmt);

      for (const child of stmt.data.statements) {
        const result = evaluateStatement(child, newstack);
      }
    case "continue":
      return {
        shouldContinue: true,
      };
    case "declaration":
      evaluateDecl(stmt.data.decl, stack);
      return {};
    case "default-case":
      return { defaultCase: true };
    case "discard":
      return { discard: true };
    case "selection":
      const cond = evalexpr(stmt.data.cond, stack);
      if (
        cond.type === "vector" &&
        cond.vectorType === "bool" &&
        cond.size === 1
      ) {
        if (cond.value[0] === 1) {
          const newstack = stackWithNewFrame(stack, stmt);
          evaluateStatement(stmt.data.rest.data.if, newstack);
          return {};
        } else if (stmt.data.rest.data.else) {
          const newstack = stackWithNewFrame(stack, stmt.data.rest.data.else);
          evaluateStatement(stmt.data.rest.data.else, newstack);
          return {};
        }
      } else {
        return {};
      }
      return {};
    case "expr":
      if (stmt.data.expr) evalexpr(stmt.data.expr, stack);
      return {};
    case "error":
      return {};
    // TODO: properly handle loop break
    case "while":
    case "do-while":
      let loops = 0;
      const doWhile = stmt.data.type === "do-while";
      while (loops < 1000000) {
        if (stmt.data.cond.data.type === "expr") {
          if (doWhile) {
            evaluateStatement(stmt, stackWithNewFrame(stack, stmt));
          }

          // break out of while loop
          const cond = evalexpr(stmt.data.cond.data.expr, stack);
          if (
            cond.type === "vector" &&
            cond.size === 1 &&
            cond.vectorType === "bool"
          ) {
            if (cond.value[0] === 0) break;
          } else {
            break;
          }

          if (!doWhile) {
            evaluateStatement(stmt, stackWithNewFrame(stack, stmt));
          }
        } else {
          // TODO: figure out hwat the hell this option is
          break;
        }
        loops++;
      }
      return {};
    case "for": {
      let loops = 0;
      const newstack = stackWithNewFrame(stack, stmt);
      evaluateStatement(stmt.data.init, newstack);
      while (loops < 1000000) {
        const newstack2 = stackWithNewFrame(newstack, stmt);
        const condition = stmt.data.rest.data.condition;
        if (!condition || condition.data.type === "expr") {
          const cond =
            condition?.data.type === "expr"
              ? evalexpr(condition.data.expr, newstack)
              : undefined;

          if (
            !cond ||
            (cond.type === "vector" &&
              cond.size === 1 &&
              cond.vectorType === "bool" &&
              cond.value[0] === 1)
          ) {
            evaluateStatement(stmt, newstack);
          } else {
            break;
          }
        } else {
          // TODO: figure this out
          break;
        }

        loops++;
      }
      return {};
    }
    case "switch": {
      const expr = evalexpr(stmt.data.expr, stack);
      const newstack = stackWithNewFrame(stack, stmt);
      let evaluating = false;
      for (const s of stmt.data.stmts) {
        // TODO: handle break statements
        if (evaluating) {
          evaluateStatement(s, newstack);
        } else {
          if (s.data.type === "case") {
            const caseExpr = evalexpr(s.data.expr, newstack);
            if (areValuesEqual(expr, caseExpr)) {
              evaluating = true;
            }
          }
        }
      }
      return {};
    }
  }
}

export function evaluateTranslationUnit(
  tu: TranslationUnit,
  scopes: Scope[],
  entryPoint: string
): StackFrame {
  const stackFrame: StackFrame = {
    correspondingScopes: scopes,
    values: new Map(),
  };

  for (const ed of tu.data) {
    if (ed.data.type === "declaration") {
      evaluateDecl(ed.data.decl, [stackFrame]);
    }
  }

  const fn = scopeFind(scopes, entryPoint);

  if (fn && fn.type === "function" && Array.isArray(fn.signatures)) {
    const sig = fn.signatures[0];
    evaluateStatement(fn.signatures[0].data.body, [stackFrame]);
  }

  return stackFrame;
}
