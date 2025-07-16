import { symbol } from "zod";
import {
  GLPrimitive,
  UniformType,
} from "../../../gl-message/protocol/GLMessageProtocol";
import { Scope } from "../langsupport/glsl-language-server";
import {
  Commented,
  Declaration,
  ExternalDeclaration,
  ExternalDeclarationFunction,
  FullySpecifiedType,
  FunctionHeader,
  InitDeclaratorList,
  SingleDeclaration,
  SingleDeclarationStart,
  SingleDeclarationVariant,
  TranslationUnit,
} from "../parser/parser";
import {
  convertType,
  getFunctionSignature,
  stringifyType,
  stringifyTypeResult,
} from "../typechecker/glsltype";
import { getExprType } from "../typechecker/typecheck";

export type OverloadSet<F> = {
  params: Record<string, OverloadSet<F>>;
  overload?: { data: F } & ShaderSymbolImport;
};

type OverloadSetRecord<F> = Record<string, OverloadSet<F>>;

type ShaderSymbolFunction<F> = {
  type: "function";
  overloads: OverloadSetRecord<F>;
};

type ShaderSymbolType<T> = {
  type: "type";
  data: T;
} & ShaderSymbolImport;

type ShaderSymbolVariable<V> = {
  type: "variable";
  datatype: string;
  data: V;
} & ShaderSymbolImport;

type ShaderSymbolImport = {
  originalFile: string;
  originalName: string;
};

export type ShaderSymbol<F, T, V> =
  | ShaderSymbolFunction<F>
  | ShaderSymbolType<T>
  | ShaderSymbolVariable<V>;

export type ShaderSymbolSet<F, T, V> = Record<string, ShaderSymbol<F, T, V>>;

export type MergeShaderSymbolSet<
  A extends ShaderSymbolSet<F, T, V>,
  B extends ShaderSymbolSet<F, T, V>,
  F,
  T,
  V,
> = {
  [K in keyof A & keyof B]: MergeShaderSymbol<A[K], B[K], F, T, V>;
} & Omit<A, keyof B> &
  Omit<B, keyof A>;

export type MergeShaderSymbol<
  A extends ShaderSymbol<F, T, V>,
  B extends ShaderSymbol<F, T, V>,
  F,
  T,
  V,
> =
  A extends ShaderSymbolFunction<F>
    ? B extends ShaderSymbolFunction<F>
      ? {
          type: "function";
          overloads: MergeOverloadSetRecord<A["overloads"], B["overloads"], F>;
        }
      : B
    : B;

export type MergeOverloadSet<
  A extends OverloadSet<F>,
  B extends OverloadSet<F>,
  F,
> = {
  params: MergeOverloadSetRecord<A["params"], B["params"], F>;
  overload: B["overload"] extends { data: F } ? B["overload"] : A["overload"];
};

export type MergeOverloadSetRecord<
  A extends OverloadSetRecord<F>,
  B extends OverloadSetRecord<F>,
  F,
> = {
  [K in keyof A & keyof B]: MergeOverloadSet<A[K], B[K], F>;
} & Omit<A, keyof B> &
  Omit<B, keyof A>;

export type SubtractShaderSymbolSet<
  A extends ShaderSymbolSet<F, T, V>,
  B extends ShaderSymbolSet<any, any, any>,
  F,
  T,
  V,
> = NoNeverProperties<{
  [K in keyof A & keyof B]: SubtractShaderSymbol<A[K], B[K], F, T, V>;
}> &
  Omit<A, keyof B>;

export type SubtractShaderSymbol<
  A extends ShaderSymbol<F, T, V>,
  B extends ShaderSymbol<any, any, any>,
  F,
  T,
  V,
> =
  A extends ShaderSymbolFunction<F>
    ? B extends ShaderSymbolFunction<any>
      ? SubtractOverloadSetRecord<A["overloads"], B["overloads"], F>
      : never
    : never;

export type SubtractOverloadSetRecord<
  A extends OverloadSetRecord<F>,
  B extends OverloadSetRecord<any>,
  F,
> = {
  [K in keyof A & keyof B]: SubtractOverloadSet<A[K], B[K], F>;
} & Omit<A, keyof B>;

export type SubtractOverloadSet<
  A extends OverloadSet<F>,
  B extends OverloadSet<any>,
  F,
> = {
  params: SubtractOverloadSetRecord<A["params"], B["params"], F>;
  overload: B["overload"] extends { data: any } ? undefined : A["overload"];
};

export type NoNeverProperties<T extends Record<any, any>> = {
  [K in keyof T as T[K] extends never ? never : K]: T[K];
};

export type IntersectShaderSymbolSet<
  A extends ShaderSymbolSet<F, T, V>,
  B extends ShaderSymbolSet<any, any, any>,
  F,
  T,
  V,
> = {
  [K in keyof A & keyof B]: A[K];
};

export type IntersectShaderSymbol<
  A extends ShaderSymbol<F, T, V>,
  B extends ShaderSymbol<any, any, any>,
  F,
  T,
  V,
> =
  A extends ShaderSymbolFunction<F>
    ? B extends ShaderSymbolFunction<F>
      ? {
          type: "function";
          overloads: IntersectOverloadSetRecord<
            A["overloads"],
            B["overloads"],
            F
          >;
        }
      : A
    : A;

export type IntersectOverloadSetRecord<
  A extends OverloadSetRecord<F>,
  B extends OverloadSetRecord<any>,
  F,
> = {
  [K in keyof A & keyof B]: IntersectOverloadSet<A[K], B[K], F>;
};

export type IntersectOverloadSet<
  A extends OverloadSet<F>,
  B extends OverloadSet<any>,
  F,
> = {
  params: IntersectOverloadSetRecord<A["params"], B["params"], F>;
  overload: B["overload"] extends { data: any } ? A["overload"] : undefined;
};

export function mergeShaderSymbolSet<
  A extends ShaderSymbolSet<F, T, V>,
  B extends ShaderSymbolSet<F, T, V>,
  F,
  T,
  V,
>(a: A, b: B): MergeShaderSymbolSet<A, B, F, T, V> {
  let outobj: ShaderSymbolSet<F, T, V> = {};

  for (const k of Object.keys(a)) {
    outobj[k] = a[k];
  }

  for (const k of Object.keys(b)) {
    if (outobj[k]) {
      outobj[k] = mergeShaderSymbol(outobj[k], b[k]);
    }
  }

  // @ts-expect-error
  return outobj;
}

export function mergeShaderSymbol<
  A extends ShaderSymbol<F, T, V>,
  B extends ShaderSymbol<F, T, V>,
  F,
  T,
  V,
>(a: A, b: B): MergeShaderSymbol<A, B, F, T, V> {
  if (a.type === "function" && b.type === "function") {
    // @ts-expect-error
    return {
      type: "function",
      overloads: mergeOverloadSetRecord(a.overloads, b.overloads),
    };
  } else {
    // @ts-expect-error
    return b;
  }
}

export function mergeOverloadSetRecord<
  A extends OverloadSetRecord<F>,
  B extends OverloadSetRecord<F>,
  F,
>(a: A, b: B): MergeOverloadSetRecord<A, B, F> {
  const outobj: OverloadSetRecord<F> = {};

  for (const k of Object.keys(a)) {
    outobj[k] = a[k];
  }

  for (const k of Object.keys(b)) {
    if (outobj[k]) {
      outobj[k] = mergeOverloadSet(outobj[k], b[k]);
    }
  }

  // @ts-expect-error
  return outobj;
}

export function mergeOverloadSet<
  A extends OverloadSet<F>,
  B extends OverloadSet<F>,
  F,
>(a: A, b: B): MergeOverloadSet<A, B, F> {
  return {
    overload: b.overload ?? a.overload,
    // @ts-expect-error
    params: mergeOverloadSetRecord(a.params, b.params),
  };
}

export function intersectShaderSymbolSet<
  A extends ShaderSymbolSet<F, T, V>,
  B extends ShaderSymbolSet<any, any, any>,
  F,
  T,
  V,
>(a: A, b: B): IntersectShaderSymbolSet<A, B, F, T, V> {
  const intersectKeys = new Set(Object.keys(a));
  const bKeys = new Set(Object.keys(b));
  for (const key of intersectKeys) {
    if (!bKeys.has(key)) intersectKeys.delete(key);
  }

  // @ts-expect-error
  return Object.fromEntries(
    [...intersectKeys].map((k) => [k, intersectShaderSymbol(a[k], b[k])])
  );
}

export function intersectShaderSymbol<
  A extends ShaderSymbol<F, T, V>,
  B extends ShaderSymbol<any, any, any>,
  F,
  T,
  V,
>(a: A, b: B): IntersectShaderSymbol<A, B, F, T, V> {
  if (a.type === "function" && b.type === "function") {
    // @ts-expect-error
    return {
      type: "function",
      overloads: intersectOverloadSetRecord(a.overloads, b.overloads),
    };
  }
  // @ts-expect-error
  return a;
}

export function intersectOverloadSetRecord<
  A extends OverloadSetRecord<F>,
  B extends OverloadSetRecord<any>,
  F,
  T,
  V,
>(a: A, b: B): IntersectOverloadSetRecord<A, B, F> {
  const intersectKeys = new Set(Object.keys(a));
  const bKeys = new Set(Object.keys(b));
  for (const key of intersectKeys) {
    if (!bKeys.has(key)) intersectKeys.delete(key);
  }

  // @ts-expect-error
  return Object.fromEntries(
    [...intersectKeys].map((k) => [k, intersectOverloadSet(a[k], b[k])])
  );
}

export function intersectOverloadSet<
  A extends OverloadSet<F>,
  B extends OverloadSet<any>,
  F,
  T,
  V,
>(a: A, b: B): IntersectOverloadSet<A, B, F> {
  return {
    params: intersectOverloadSetRecord(a.params, b.params),
    // @ts-expect-error
    overload: b.overload ? a.overload : undefined,
  };
}

export function singleFunctionOverload<F, T, V>(
  name: string,
  originalName: string,
  originalFile: string,
  retType: string,
  paramTypes: string[],
  data: F
): ShaderSymbolSet<F, T, V> {
  let os: OverloadSet<F> = {
    params: {},
    overload: {
      data,
      originalFile,
      originalName,
    },
  };

  for (const p of paramTypes.concat().reverse()) {
    os = {
      params: {
        [p]: os,
      },
      overload: undefined,
    };
  }

  return {
    [name]: {
      type: "function",
      overloads: { [retType]: os },
    },
  };
}

type ShaderSymbolFnNodeData =
  | {
      type: "definition";
      definition: ExternalDeclarationFunction;
    }
  | {
      type: "prototype";
      prototype: FunctionHeader;
    };

type ShaderSymbolTypeNodeData = {
  name: Commented<string>;
  decl: Declaration & { type: "struct" };
};

type ShaderSymbolVariableNodeData = {
  declList: Declaration & { type: "declarator-list" };
  type: Commented<FullySpecifiedType>;
  decl: SingleDeclaration;
};

type ShaderSymbolSetWithNodes = ShaderSymbolSet<
  ShaderSymbolFnNodeData,
  ShaderSymbolTypeNodeData,
  ShaderSymbolVariableNodeData
>;

type BundleContext = {
  // if we encounter repeats, give up (avoid infinite cycles)
  filenames: string[];
  getSymbols: (path: string) => Promise<ShaderSymbolSetWithNodes | undefined>;
  resolvePath: (filename: string, path: string) => string;
};

async function getSymbolSetOfExternalDeclaration(
  ed: ExternalDeclaration,
  scopes: Scope[],
  context: BundleContext
): Promise<ShaderSymbolSetWithNodes> {
  if (ed.type === "function") {
    const fnsig = getFunctionSignature(ed.prototype.data, scopes);
    return singleFunctionOverload<
      ShaderSymbolFnNodeData,
      ShaderSymbolTypeNodeData,
      ShaderSymbolVariableNodeData
    >(
      fnsig.name,
      fnsig.name,
      context.filenames.at(-1)!,
      stringifyTypeResult(fnsig.returnType),
      fnsig.paramTypes.map(stringifyTypeResult),
      {
        type: "definition",
        definition: ed,
      }
    );
  } else if (ed.type === "declaration") {
    const decl = ed.decl.data;
    if (decl.type === "declarator-list") {
      const list = decl.declaratorList.data;
      if (list.init.data.type === "type") {
        const typestr = stringifyTypeResult(
          convertType(list.init.data.declType.data, scopes)
        );
        const ps: ShaderSymbolSetWithNodes = {};
        for (const d of list.declarations.data) {
          ps[d.data.name.data] = {
            type: "variable",
            datatype: typestr,
            data: {
              declList: decl,
              type: list.init.data.declType,
              decl: d.data,
            },
            originalFile: context.filenames.at(-1)!,
            originalName: d.data.name.data,
          };
        }
        return ps;
      } else {
        return {};
      }
    } else if (decl.type === "struct") {
      return {
        [decl.name.data]: {
          type: "type",
          data: {
            name: decl.name,
            decl,
          },
          originalFile: context.filenames.at(-1)!,
          originalName: decl.name.data,
        },
      };
    } else if (decl.type === "function-prototype") {
      const fnsig = getFunctionSignature(decl.prototype.data, scopes);
      return singleFunctionOverload(
        fnsig.name,
        fnsig.name,
        context.filenames.at(-1)!,
        stringifyTypeResult(fnsig.returnType),
        fnsig.paramTypes.map(stringifyTypeResult),
        {
          type: "prototype",
          prototype: decl.prototype.data,
        }
      );
    }
  } else if (ed.type === "import") {
    const resolvedPath = context.resolvePath(
      context.filenames.at(-1)!,
      ed.from
    );
    const symbols = await context.getSymbols(resolvedPath);
    if (!symbols) return {};

    if (ed.imports.data.type === "all") {
      const prefix = ed.imports.data.prefix;
      return Object.fromEntries(
        Object.entries(symbols).map(([k, v]) => [prefix + k, v])
      );
    } else {
      return Object.fromEntries(
        ed.imports.data.imports.flatMap((e) => {
          if (e.data.name.type === "all-overloads") {
            const s = symbols[e.data.name.name];
            if (!s) return [];
            return [[e.data.alias ?? e.data.name.name, s]];
          } else {
            const name = e.data.name.proto.data.name.data;
            const fnsig = getFunctionSignature(e.data.name.proto.data, scopes);
            const s = intersectShaderSymbolSet(
              symbols,
              singleFunctionOverload(
                name,
                name,
                "",
                stringifyTypeResult(fnsig.returnType),
                fnsig.paramTypes.map(stringifyTypeResult),
                undefined
              )
            )[name];
            if (!s) return [];
            return [[e.data.alias ?? name, s]];
          }
        })
      );
    }
  }
  return {};
}

async function getSymbolSetOfTranslationUnit(
  tu: TranslationUnit,
  scopes: Scope[],
  context: BundleContext
) {
  let symbolSet: ShaderSymbolSetWithNodes = {};
  const edSymbolSets = await Promise.all(
    tu.data.map((d) =>
      getSymbolSetOfExternalDeclaration(d.data, scopes, context)
    )
  );
  for (const edss of edSymbolSets) {
    symbolSet = mergeShaderSymbolSet(symbolSet, edss);
  }
  return symbolSet;
}
