import React from "react";
import { z } from "zod";
import { NumberField } from "./fields/NumberField";
import "./GLMessageUI.css";

const keyValuePairs = <K extends z.ZodType, V extends z.ZodType>(
  k: K,
  v: V
): z.ZodArray<z.ZodTuple<[K, V]>> => z.array(z.tuple([k, v]));

export type UIOptionMenu = {
  type: "menu";
  name?: string;
  desc?: string;
  fields: Record<string, UIOption>;
};

export type UIOptionNumerical = {
  type: "number";
  min?: number;
  max?: number;
  step?: number; // default 0.001
  scaling?: "linear" | "log"; // default "log"
  sensitivity?: number;
} & (
  | {
      count: 1 | 2 | 3 | 4;
      format?: "number" | "slider";
    }
  | {
      count: 2;
      // draggable position you can move around on the output
      format?: "position";
    }
) &
  (
    | { count: 1; defaultValue: number }
    | {
        count: 2;
        defaultValue: [number, number];
      }
    | {
        count: 3;
        defaultValue: [number, number, number];
      }
    | {
        count: 4;
        defaultValue: [number, number, number, number];
      }
  );

export type UIOptionOrbitControls = {
  type: "orbit";
};

export type UIOptionFirstPersonControls = {
  type: "first-person";
};

export type UIOptionSelect<K extends string> = {
  type: "select";
  options: Record<K, UIOption>;
  defaultOption: K;
};

export type Matrix4x4 = [
  number,
  number,
  number,
  number,

  number,
  number,
  number,
  number,

  number,
  number,
  number,
  number,

  number,
  number,
  number,
  number,
];

export type UIOption = UIOptionMenu | UIOptionNumerical;
// | UIOptionOrbitControls
// | UIOptionFirstPersonControls
// | UIOptionSelect<string>;

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
    : T extends UIOptionOrbitControls
      ? {
          transform: Matrix4x4;
        }
      : T extends UIOptionFirstPersonControls
        ? {
            transform: Matrix4x4;
          }
        : T extends UIOptionSelect<string>
          ? {
              [K in keyof T["options"]]: { type: K; value: T["options"][K] };
            }[keyof T["options"]]
          : never;

export type UniformSpec = {
  type: "float" | "int" | "uint";
  count: 1 | 2 | 3 | 4;
};

export type ShaderInputOutputSpec = {
  type: "float" | "int" | "uint";
  count: 1 | 2 | 3 | 4;
};

// type ASDASDASD = UIReturnType<{
//   type: "select";
//   options: {
//     a: { type: "number"; count: 1; defaultValue: 10 };
//     b: { type: "number"; count: 2; defaultValue: [5, 6]; format: "position" };
//   };
//   defaultOption: "a";
// }>;

export type ShaderSpec = {
  uniforms: Record<string, UniformSpec>;
  inputs: Record<string, ShaderInputOutputSpec>;
  outputs: Record<string, ShaderInputOutputSpec>;
};

export type RenderTargetSpec = Record<string, ShaderInputOutputSpec>;

type GLMessageUIProps<UI extends UIOption> = {
  template: UI;
  value: UIReturnType<UI>;
  setValue: (f: (oldValue: UIReturnType<UI>) => UIReturnType<UI>) => void;
};

export function GLMessageUIField<UI extends UIOption>(
  props: GLMessageUIProps<UI>
) {
  if (props.template.type === "number") {
    if (props.template.count === 1) {
      return (
        <div className="glm-numerical-field">
          <NumberField
            value={props.value as number}
            setValue={(v) => props.setValue((o) => v as UIReturnType<UI>)}
            options={{
              stepSize: props.template.step ?? 0.001,
              min: props.template.min ?? -Infinity,
              max: props.template.max ?? Infinity,
              sensitivity: props.template.sensitivity ?? 1,
            }}
          ></NumberField>
        </div>
      );
    } else {
      return (
        <div className="glm-numerical-field">
          {new Array(props.template.count).fill(0).map((_, i) =>
            props.template.type === "number" ? (
              <NumberField
                key={i}
                value={(props.value as any)[i]}
                setValue={(v) =>
                  props.setValue((o: any) =>
                    o.map((e: any, j: number) => (i === j ? v : e))
                  )
                }
                options={{
                  stepSize: props.template.step ?? 0.001,
                  min: props.template.min ?? -Infinity,
                  max: props.template.max ?? Infinity,
                  sensitivity: props.template.sensitivity ?? 1,
                }}
              ></NumberField>
            ) : (
              <></>
            )
          )}
        </div>
      );
    }
  } else {
    return (
      <div className="glm-menu-field">
        {Object.entries(props.template.fields).map(([key, field]) => (
          <div className="glm-menu-property">
            <label>{key}</label>
            <GLMessageUIField
              template={field}
              value={(props.value as any)[key]}
              setValue={(v) =>
                props.setValue((o: any) => ({ ...o, [key]: v(o[key]) }))
              }
            ></GLMessageUIField>
          </div>
        ))}
      </div>
    );
  }
}

export function getGLMessageUIDefaultValue<UI extends UIOption>(
  ui: UI
): UIReturnType<UI> {
  if (ui.type === "number") {
    // @ts-expect-error
    return ui.defaultValue;
  } else {
    // @ts-expect-error
    return Object.fromEntries(
      Object.entries(ui.fields).map(([k, v]) => [
        k,
        getGLMessageUIDefaultValue(v),
      ])
    );
  }
}
