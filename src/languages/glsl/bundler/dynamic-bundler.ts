import {
  GLPrimitive,
  UniformType,
} from "../../../gl-message/protocol/GLMessageProtocol";
import { TranslationUnit } from "../parser/parser";

type ShaderFunctionSignatures<T = true> = {
  retTypes: Record<string, ShaderFunctionParameters<T>>;
};

type ShaderVariableSignatures<T = undefined> = {
  variables: Record<
    string,
    {
      name: string;
      data: T;
    }
  >;
};

type ShaderTypeDefinitions<T = undefined> = {
  types: Record<
    string,
    {
      name: string;
      data: T;
    }
  >;
};

type ShaderSymbolSet<
  F = true,
  V = undefined,
  T = undefined,
> = ShaderFunctionSignatures<F> &
  ShaderVariableSignatures<V> &
  ShaderTypeDefinitions<T>;

type ShaderFunctionParameters<T = true> = {
  params: Record<string, ShaderFunctionParameters<T>>;
  functions: Record<string, T>;
};

type GetFunctionsWithSignature<
  T extends ShaderFunctionSignatures,
  RetType extends string,
  ParamTypes extends string[],
> = GetFunctionsWithSignatureParamsOnly<T["retTypes"][RetType], ParamTypes>;

type GetFunctionsWithSignatureParamsOnly<
  T extends ShaderFunctionParameters,
  ParamTypes extends string[],
> = ParamTypes extends [
  infer First extends string,
  ...infer Rest extends string[],
]
  ? GetFunctionsWithSignatureParamsOnly<T["params"][First], Rest>
  : keyof T["functions"];

type ExcludeSigsRaw<
  T,
  A extends ShaderFunctionSignatures<T>,
  B extends ShaderFunctionSignatures<T>,
> = {
  retTypes: {
    [K in keyof A["retTypes"]]: ExcludeSigsParamsOnly<
      T,
      A["retTypes"][K],
      B["retTypes"][K]
    >;
  };
};

type ExcludeSigs<
  T,
  A extends ShaderFunctionSignatures<T>,
  B extends ShaderFunctionSignatures<T>,
> = KillEmptySigs<T, ExcludeSigsRaw<T, A, B>>;

type NoNeverProps<T> = {
  [K in keyof T as T[K] extends never ? never : K]: T[K];
};

type ExcludeSigsParamsOnly<
  T,
  A extends ShaderFunctionParameters<T>,
  B extends ShaderFunctionParameters<T>,
> = {
  params: {
    [K in keyof A["params"]]: B["params"][K] extends ShaderFunctionParameters<T>
      ? ExcludeSigsParamsOnly<T, A["params"][K], B["params"][K]>
      : A["params"][K];
  };
  functions: {
    [K in Exclude<keyof A["functions"], keyof B["functions"]>]: T;
  };
};

type KillEmptySigs<T, A extends ShaderFunctionSignatures<T>> = {
  retTypes: NoNeverProps<{
    [K in keyof A["retTypes"]]: KillEmptySigsParamsOnly<
      T,
      KillEmptySigsParamsOnlyInner<T, A["retTypes"][K]>
    >;
  }>;
};

type KillEmptySigsParamsOnly<T, A extends ShaderFunctionParameters<T>> =
  {} extends NoNeverProps<A["functions"]>
    ? {} extends NoNeverProps<A["params"]>
      ? never
      : A
    : A;

type KillEmptySigsParamsOnlyInner<T, A extends ShaderFunctionParameters<T>> = {
  functions: A["functions"];
  params: NoNeverProps<{
    [K in keyof A["params"]]: KillEmptySigsParamsOnly<
      T,
      KillEmptySigsParamsOnlyInner<T, A["params"][K]>
    >;
  }>;
};

type ContainsNoSignatures<A extends ShaderFunctionSignatures> = {
  retTypes: {};
} extends A
  ? true
  : false;

type MergeSignatures<
  T,
  A extends ShaderFunctionSignatures<T>,
  B extends ShaderFunctionSignatures<T>,
> = {
  retTypes: {
    [K in keyof A["retTypes"]]: B["retTypes"] extends Record<
      K,
      ShaderFunctionParameters<T>
    >
      ? MergeSignaturesParamsOnly<T, A["retTypes"][K], B["retTypes"][K]>
      : A["retTypes"][K];
  } & {
    [K in Exclude<keyof B["retTypes"], keyof A["retTypes"]>]: B["retTypes"][K];
  };
};

type MergeSignaturesParamsOnly<
  T,
  A extends ShaderFunctionParameters<T>,
  B extends ShaderFunctionParameters<T>,
> = {
  functions: A["functions"] & B["functions"];
  params: {
    [K in keyof A["params"]]: B["params"] extends Record<
      K,
      ShaderFunctionParameters
    >
      ? MergeSignaturesParamsOnly<T, A["params"][K], B["params"][K]>
      : A["params"][K];
  } & {
    [K in Exclude<keyof B["params"], keyof A["params"]>]: B["params"][K];
  };
};

type RenameSignatures<
  T,
  A extends ShaderFunctionSignatures<T>,
  B extends ShaderFunctionSignatures<string>,
> = {
  retTypes: {
    [K in keyof A["retTypes"]]: B["retTypes"] extends Record<
      K,
      ShaderFunctionParameters<string>
    >
      ? RenameSignaturesParamsOnly<T, A["retTypes"][K], B["retTypes"][K]>
      : A["retTypes"][K];
  };
};

type RenameSignaturesParamsOnly<
  T,
  A extends ShaderFunctionParameters<T>,
  B extends ShaderFunctionParameters<string>,
> = {
  functions: {
    [K in keyof A["functions"] as B["functions"] extends Record<K, string>
      ? B["functions"][K]
      : K]: true;
  };
  params: {
    [K in keyof A["params"]]: B["params"] extends Record<
      K,
      ShaderFunctionParameters<string>
    >
      ? RenameSignaturesParamsOnly<T, A["params"][K], B["params"][K]>
      : A["params"][K];
  };
};

interface IShaderSource<
  MissingImplementations extends ShaderFunctionSignatures,
  ProvidedImplementations extends ShaderFunctionSignatures,
  Inputs extends Record<string, GLPrimitive>,
  Outputs extends Record<string, GLPrimitive>,
  Uniforms extends Record<string, UniformType>,
> {
  getShaderInfo: () => {
    missingImpls: MissingImplementations;
    providedImpls: ProvidedImplementations;
    inputs: Inputs;
    outputs: Outputs;
    uniforms: Uniforms;
  };
  getShaderRef: ContainsNoSignatures<MissingImplementations> extends true
    ? <Type extends "vertex" | "fragment">(
        type: Type
      ) => Promise<{
        inputs: Inputs;
        outputs: Outputs;
        uniforms: Uniforms;
        shaderType: Type;
        id: string;
      }>
    : never;
  extend<
    MissingImplementations2 extends ShaderFunctionSignatures,
    ProvidedImplementations2 extends ShaderFunctionSignatures,
    Inputs2 extends Record<string, GLPrimitive>,
    Outputs2 extends Record<string, GLPrimitive>,
    Uniforms2 extends Record<string, UniformType>,
  >(
    shader: ShaderSource<
      MissingImplementations2,
      ProvidedImplementations2,
      Inputs2,
      Outputs2,
      Uniforms2
    >
  ): ShaderSource<
    MergeSignatures<
      true,
      ExcludeSigs<true, MissingImplementations, ProvidedImplementations2>,
      ExcludeSigs<true, MissingImplementations2, ProvidedImplementations>
    >,
    MergeSignatures<true, ProvidedImplementations, ProvidedImplementations2>,
    Inputs & Inputs2,
    Outputs & Outputs2,
    Uniforms & Uniforms2
  >;
  rename<Sigs extends ShaderFunctionSignatures<string>>(
    sigs: Sigs
  ): ShaderSource<
    RenameSignatures<true, MissingImplementations, Sigs>,
    RenameSignatures<true, ProvidedImplementations, Sigs>,
    Inputs,
    Outputs,
    Uniforms
  >;
}

class ShaderSource<
  MissingImplementations extends ShaderFunctionSignatures,
  ProvidedImplementations extends ShaderFunctionSignatures,
  Inputs extends Record<string, GLPrimitive>,
  Outputs extends Record<string, GLPrimitive>,
  Uniforms extends Record<string, UniformType>,
> implements
    IShaderSource<
      MissingImplementations,
      ProvidedImplementations,
      Inputs,
      Outputs,
      Uniforms
    >
{
  ast: TranslationUnit;
  missingImpls: MissingImplementations;
  providedImpls: ProvidedImplementations;
  inputs: Inputs;
  outputs: Outputs;
  uniforms: Uniforms;
  // @ts-expect-error
  getShaderRef: ContainsNoSignatures<MissingImplementations> extends true
    ? <Type extends "vertex" | "fragment">(
        type: Type
      ) => Promise<{
        inputs: Inputs;
        outputs: Outputs;
        uniforms: Uniforms;
        shaderType: Type;
        id: string;
      }>
    : never;

  constructor(
    ast: TranslationUnit,
    missingImpls: MissingImplementations,
    providedImpls: ProvidedImplementations,
    inputs: Inputs,
    outputs: Outputs,
    uniforms: Uniforms,
    getShaderRef: <Type extends "vertex" | "fragment">(
      ast: TranslationUnit,
      inputs: Inputs,
      outputs: Outputs,
      uniforms: Uniforms,
      type: Type
    ) => Promise<{
      inputs: Inputs;
      outputs: Outputs;
      uniforms: Uniforms;
      shaderType: Type;
      id: string;
    }>
  ) {
    this.missingImpls = missingImpls;
    this.providedImpls = providedImpls;
    this.inputs = inputs;
    this.outputs = outputs;
    this.uniforms = uniforms;
    this.ast = ast;

    if (Object.keys(missingImpls.retTypes).length === 0) {
      // @ts-expect-error
      this.getShaderRef = <Type extends "vertex" | "fragment">(type: Type) => {
        return getShaderRef(
          this.ast,
          this.inputs,
          this.outputs,
          this.uniforms,
          type
        );
      };
    }
  }

  getShaderInfo() {
    return this;
  }

  extend<
    MissingImplementations2 extends ShaderFunctionSignatures,
    ProvidedImplementations2 extends ShaderFunctionSignatures,
    Inputs2 extends Record<string, GLPrimitive>,
    Outputs2 extends Record<string, GLPrimitive>,
    Uniforms2 extends Record<string, UniformType>,
  >(
    shader: ShaderSource<
      MissingImplementations2,
      ProvidedImplementations2,
      Inputs2,
      Outputs2,
      Uniforms2
    >
  ): ShaderSource<
    MergeSignatures<
      true,
      ExcludeSigs<true, MissingImplementations, ProvidedImplementations2>,
      ExcludeSigs<true, MissingImplementations2, ProvidedImplementations>
    >,
    MergeSignatures<true, ProvidedImplementations, ProvidedImplementations2>,
    Inputs & Inputs2,
    Outputs & Outputs2,
    Uniforms & Uniforms2
  > {
    throw new Error("Method not implemented.");
  }
  rename<Sigs extends ShaderFunctionSignatures<string>>(
    sigs: Sigs
  ): ShaderSource<
    RenameSignatures<true, MissingImplementations, Sigs>,
    RenameSignatures<true, ProvidedImplementations, Sigs>,
    Inputs,
    Outputs,
    Uniforms
  > {
    throw new Error("Method not implemented.");
  }
}

type ASDASDSD = RenameSignatures<
  true,
  {
    retTypes: {
      vec4: {
        params: {
          vec4: {
            params: {};
            functions: {
              penis: true;
            };
          };
        };
        functions: {
          shit: true;
          fuck: true;
        };
      };
      vec2: {
        params: {};
        functions: {
          shit: true;
          fuck: true;
        };
      };
    };
  },
  {
    retTypes: {
      vec4: {
        params: {
          vec4: {
            params: {};
            functions: {
              penis: "penis2";
            };
          };
        };
        functions: {
          shit: "ass";
          fuck: "fuck2";
          cunt: "cutn2";
        };
      };
    };
  }
>["retTypes"]["vec4"]["params"]["vec4"];

type ASDASD = MergeSignatures<
  true,
  {
    retTypes: {
      vec3: {
        params: {};
        functions: {
          ass: true;
        };
      };
      vec4: {
        params: {
          vec4: {
            params: {};
            functions: {
              piss: true;
            };
          };
          vec3: {
            params: {};
            functions: {
              poopy: true;
            };
          };
        };
        functions: {
          poop: true;
        };
      };
    };
  },
  {
    retTypes: {
      vec2: {
        params: {};
        functions: {
          cunt: true;
        };
      };
      vec4: {
        params: {
          vec3: {
            params: {};
            functions: {
              poopy2: true;
            };
          };
          vec2: {
            params: {};
            functions: {
              poopy3: true;
            };
          };
        };
        functions: {
          butt: true;
        };
      };
    };
  }
>["retTypes"]["vec4"]["params"]["vec3"];
