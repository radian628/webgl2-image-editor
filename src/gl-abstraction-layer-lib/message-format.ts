import { z } from "zod";

const keyValuePairs = <K extends z.ZodType, V extends z.ZodType>(
  k: K,
  v: V
): z.ZodArray<z.ZodTuple<[K, V]>> => z.array(z.tuple([k, v]));

type UIOptionMenu = {
  type: "menu";
  name?: string;
  desc?: string;
  fields: Record<string, UIOption>;
};

type UIOptionNumerical = {
  type: "float" | "int" | "uint";
  count: 1 | 2 | 3 | 4;
};

export type UIOption = UIOptionMenu | UIOptionNumerical;

export type UIReturnType<T extends UIOption> = T extends UIOptionMenu
  ? {
      [Key in keyof T["fields"]]: UIReturnType<T["fields"][Key]>;
    }
  : T extends UIOptionNumerical
  ? T["count"] extends 1
    ? number
    : T["count"] extends 2
    ? [number, number]
    : T["count"] extends 3
    ? [number, number, number]
    : T["count"] extends 4
    ? [number, number, number, number]
    : never
  : never;

export type UniformSpec = {
  type: "float" | "int" | "uint";
  count: 1 | 2 | 3 | 4;
};

export type ShaderInputOutputSpec = {
  type: "float" | "int" | "uint";
  count: 1 | 2 | 3 | 4;
};

export type ShaderSpec = {
  uniforms: Record<string, UniformSpec>;
  inputs: Record<string, ShaderInputOutputSpec>;
  outputs: Record<string, ShaderInputOutputSpec>;
};

export type RenderTargetSpec = Record<string, ShaderInputOutputSpec>;
