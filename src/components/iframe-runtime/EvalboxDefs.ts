import {
  Matrix4x4,
  UIOption,
  UIOptionFirstPersonControls,
  UIOptionOrbitControls,
  UIOptionSelect,
  UIReturnType,
} from "../GLMessageUI";
import * as userInterface from "./EvalboxUIWrapper";
import { createGLMessageClient } from "./GLMessageClient";
import {
  GLPrimitive,
  MenuRef,
  ProgramRef,
  ShaderRef,
} from "./GLMessageProtocol";
import * as glm from "./GLMessageProtocol";

type GLMessageClient = ReturnType<typeof createGLMessageClient>;

declare global {
  const clear: GLMessageClient["clear"];
  const createBufferFromArray: GLMessageClient["createBufferFromArray"];
  function linkProgram<
    VertexShader extends ShaderRef<"vertex">,
    FragmentShader extends ShaderRef<"fragment">,
  >(
    vertex: VertexShader,
    fragment: FragmentShader
  ): VertexShader["outputs"] extends FragmentShader["inputs"]
    ? FragmentShader["inputs"] extends VertexShader["outputs"]
      ? Promise<{
          inputs: VertexShader["inputs"];
          outputs: FragmentShader["outputs"];
          uniforms: VertexShader["uniforms"] & FragmentShader["uniforms"];
          id: string;
        }>
      : undefined
    : undefined;
  const sendGLMessage: GLMessageClient["sendGLMessage"];
  const draw: GLMessageClient["draw"];
  const create8BitRGBATexture: GLMessageClient["create8BitRGBATexture"];
  function loop(callback: (time: number) => any): () => void;
  const createMenu: <UI extends UIOption>(
    menu: UI
  ) => Promise<{
    id: string;
    menu: UI;
  }>;
  type UIOptionMenu = {
    type: "menu";
    name?: string;
    desc?: string;
    fields: Record<string, UIOption>;
  };

  type UIOptionNumerical = {
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

  // type UIReturnType<T extends UIOption> = T extends UIOptionMenu
  //   ? {
  //       [Key in keyof T["fields"]]: UIReturnType<T["fields"][Key]>;
  //     }
  //   : T extends UIOptionNumerical
  //     ? T["count"] extends 1
  //       ? number
  //       : T["count"] extends 2
  //         ? [number, number]
  //         : T["count"] extends 3
  //           ? [number, number, number]
  //           : T["count"] extends 4
  //             ? [number, number, number, number]
  //             : never
  //     : T extends UIOptionOrbitControls
  //       ? {
  //           transform: Matrix4x4;
  //         }
  //       : T extends UIOptionFirstPersonControls
  //         ? {
  //             transform: Matrix4x4;
  //           }
  //         : T extends UIOptionSelect<string>
  //           ? {
  //               [K in keyof T["options"]]: {
  //                 type: K;
  //                 value: T["options"][K];
  //               };
  //             }[keyof T["options"]]
  //           : never;
  const pollMenu: <T extends UIOption>(menu: {
    menu: T;
    id: string;
  }) => Promise<UIReturnType<T>>;
  const ui: Omit<userInterface.UI, "menu" | "float" | "vec2" | "int"> & {
    menu: <F extends Record<string, UIOption>>(
      name: string,
      fields: F,
      desc: string
    ) => { type: "menu"; fields: F; desc: string };
    float: (
      defaultValue: number,
      options?: userInterface.FloatOptions
    ) => {
      type: "number";
      count: 1;
      defaultValue: number;
    };
    int: (
      defaultValue: number,
      options?: userInterface.FloatOptions
    ) => {
      type: "number";
      count: 1;
      defaultValue: number;
    };
    vec2: (
      defaultValue: [number, number],
      options?: userInterface.FloatOptions
    ) => {
      type: "number";
      count: 2;
      defaultValue: [number, number];
    };
  };
  type UniformType = glm.UniformType;
  type UniformsToValues<G extends Record<string, UniformType>> =
    glm.UniformsToValues<G>;
  const resize: GLMessageClient["resize"];
  const getWindowSize: GLMessageClient["getWindowSize"];
}

export type PleaseWorkFFS<T extends UIOption> =
  UIOption extends UIOptionNumerical ? UIReturnType<T> : UIReturnType<T>;
