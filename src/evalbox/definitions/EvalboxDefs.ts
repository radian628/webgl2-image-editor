import * as userInterface from "../runtime/EvalboxUIWrapper";
import { createGLMessageClient } from "../runtime/GLMessageClient";
import * as glclient from "../runtime/GLMessageClient";
import * as glm from "../../gl-message/protocol/GLMessageProtocol";

declare global {
  type GLMessageClient = ReturnType<typeof createGLMessageClient>;
  function loop(callback: (time: number) => any): () => void;
  const ui: userInterface.UI;
  const range: typeof glclient.range;
  type UniformType = glm.UniformType;
  type UniformsToValues<G extends Record<string, UniformType>> =
    glm.UniformsToValues<G>;
  type ShaderFunctionSignatures = {
    retTypes: Record<string, ShaderFunctionParameters>;
  };

  type ShaderFunctionParameters = {
    params: Record<string, ShaderFunctionParameters>;
    functions: Record<string, true>;
  };

  type IsValidComposite<
    T extends ShaderFunctionSignatures,
    FnName extends
      keyof T["retTypes"]["vec4"]["params"]["vec4"]["params"]["vec4"]["functions"],
  > = T["retTypes"]["vec4"]["params"]["vec4"]["params"]["vec4"]["functions"][FnName];

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

  type ExcludeSigs<
    A extends ShaderFunctionSignatures,
    B extends ShaderFunctionSignatures,
  > = {
    retTypes: {
      [K in keyof A["retTypes"]]: ExcludeSigsParamsOnly<
        A["retTypes"][K],
        B["retTypes"][K]
      >;
    };
  };

  type NoNeverProps<T> = {
    [K in keyof T as T[K] extends never ? never : K]: T[K];
  };

  type ExcludeSigsParamsOnly<
    A extends ShaderFunctionParameters,
    B extends ShaderFunctionParameters,
  > = {
    params: {
      [K in keyof A["params"]]: B["params"][K] extends ShaderFunctionParameters
        ? ExcludeSigsParamsOnly<A["params"][K], B["params"][K]>
        : A["params"][K];
    };
    functions: {
      [K in Exclude<keyof A["functions"], keyof B["functions"]>]: true;
    };
  };

  type KillEmptySigs<A extends ShaderFunctionSignatures> = {
    retTypes: NoNeverProps<{
      [K in keyof A["retTypes"]]: KillEmptySigsParamsOnly<
        KillEmptySigsParamsOnlyInner<A["retTypes"][K]>
      >;
    }>;
  };

  type KillEmptySigsParamsOnly<A extends ShaderFunctionParameters> =
    {} extends NoNeverProps<A["functions"]>
      ? {} extends NoNeverProps<A["params"]>
        ? never
        : A
      : A;

  type KillEmptySigsParamsOnlyInner<A extends ShaderFunctionParameters> = {
    functions: A["functions"];
    params: NoNeverProps<{
      [K in keyof A["params"]]: KillEmptySigsParamsOnly<
        KillEmptySigsParamsOnlyInner<A["params"][K]>
      >;
    }>;
  };

  type ContainsNoSignatures<A extends ShaderFunctionSignatures> = {
    retTypes: {};
  } extends A
    ? true
    : false;
}
