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
import { Scope, ScopeItem } from "./glsl-language-server";
import {
  builtinType,
  getTypePrimitiveArity,
  getTypePrimitiveCategory,
  isArrayType,
  nodeTypeErr,
  stringifyType,
  TypeError,
  TypeResult,
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
    types: { type: FullySpecifiedType | undefined; expr: ASTNode<Expr> }[]
  ): TypeResult => {
    let slots = 0;
    let errors: TypeError = [];
    let slotsUnknown = false;
    for (const t of types) {
      const arity = getTypePrimitiveArity(t.type);
      if (t.type && (!arity || isArrayType(t.type))) {
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
      type: builtinType(retType),
      errors,
    };
  };
}

for (let arity = 2; arity <= 4; arity++) {
  for (const vec of ["vec", "ivec", "uvec", "bvec"]) {
    glslBuiltinsMap.set(`${vec}${arity}`, {
      type: "function",
      signatures: genericVectorConstructor(
        `${vec}${arity}`,
        arity as 2 | 3 | 4
      ),
    });
  }
}

for (const type of ["int", "uint", "float", "bool"]) {
  glslBuiltinsMap.set(type, {
    type: "function",
    signatures: genericVectorConstructor(type, 1),
  });
}

export const glslBuiltinScope = (start: number, end: number): Scope => ({
  start,
  end,
  items: glslBuiltinsMap,
  innerScopes: [],
  innerScopeMap: new Map(),
});
