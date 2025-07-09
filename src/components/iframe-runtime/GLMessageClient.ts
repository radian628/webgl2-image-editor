import { v4 } from "uuid";
import {
  GLMessage,
  GLMessageResponse,
  BufferRef,
  GLPrimitive,
  ShaderRef,
  typeNameToGLPrimitive,
  ProgramRef,
  BufferInputRef,
  GLPrimitiveToNumber,
  UniformTypeValue,
  TextureRef,
  MenuRef,
} from "./GLMessageProtocol";
import { parseGLSLWithoutPreprocessing } from "../../glsl-analyzer/parser-combined";
import { getInputsOutputsAndUniforms } from "../../glsl-analyzer/get-inputs-outputs";
import { UIOption, UIReturnType } from "../GLMessageUI";

export type RangeObject = {
  map(
    min: number,
    max: number,
    includeStart?: boolean,
    includeEnd?: boolean
  ): number;
  divideInterval(min: number, max: number): [number, number];
  index: number;
  step: number;
};

export function range<T extends any | Promise<any>>(
  divisions: number,
  cb: (range: RangeObject) => T
): T extends Promise<any> ? Promise<Awaited<T>[]> : T {
  let out: any = [];
  for (let i = 0; i < divisions; i++) {
    out.push(
      cb({
        index: i,
        map(min, max, includeStart = true, includeEnd = false) {
          const step =
            (max - min) /
            (divisions + 1 - (includeStart ? 1 : 0) - (includeEnd ? 1 : 0));
          let startPoint = min + (includeStart ? 0 : step);
          return startPoint + i * step;
        },
        divideInterval(min, max) {
          return [this.map(min, max), this.map(min, max, false, true)];
        },
        step: 1 / divisions,
      })
    );
  }

  if (out[0] && out[0] instanceof Promise) {
    // @ts-expect-error
    return Promise.all(out);
  }
  return out;
}

export function createGLMessageClient(
  send: <Msg extends GLMessage>(msg: Msg) => Promise<GLMessageResponse<Msg>>
) {
  return {
    clear(
      color?: [number, number, number, number],
      depth?: number,
      stencil?: number
    ) {
      return send({
        contents: {
          type: "clear",
          color,
          depth,
          stencil,
        },
        id: v4(),
      });
    },
    async createBufferFromArray<
      P extends {
        array: number[];
        count: 1 | 2 | 3 | 4;
        encoding:
          | "float"
          | "int"
          | "uint"
          | "normalized-int"
          | "normalized-uint";
        size: 8 | 16 | 32;
      },
    >(params: P) {
      const { count, encoding, size, array } = params;
      return (
        await send({
          id: v4(),
          contents: {
            type: "create-buffer",
            id: v4(),
            source: {
              type: "array",
              spec: [
                {
                  count,
                  encoding,
                  size,
                  value: array,
                  name: "attr",
                  stride: 0,
                  offset: 0,
                },
              ],
            },
          },
        })
      ).content;
    },
    async linkProgram<VertexOutsFragIns extends Record<string, GLPrimitive>>(
      vertex: ShaderRef<"vertex"> & { outputs: VertexOutsFragIns },
      fragment: ShaderRef<"fragment"> & { inputs: VertexOutsFragIns }
    ) {
      return (
        await send({
          id: v4(),
          contents: {
            type: "create-program",
            id: v4(),
            vertex,
            fragment,
          },
        })
      ).content;
    },
    sendGLMessage<Msg extends GLMessage>(msg: Msg) {
      return send(msg);
    },
    async draw<Prog extends ProgramRef>(
      program: Prog,
      count: number,
      inputs: { [Key in keyof Prog["inputs"]]: BufferInputRef },
      outputs: { [Key in keyof Prog["outputs"]]: TextureRef | null },
      uniforms: {
        [Key in keyof Prog["uniforms"]]: UniformTypeValue<
          Prog["uniforms"][Key]
        >;
      }
    ) {
      return send({
        id: v4(),
        contents: {
          type: "draw",
          program,
          inputs,
          outputs,
          uniforms,
          count,
        },
      });
    },
    async create8BitRGBATexture(
      pixels: ArrayBuffer | undefined,
      width: number,
      height: number
    ) {
      return (
        await send({
          id: v4(),
          contents: {
            type: "create-texture",
            pixels,
            width,
            height,
            internalformat: WebGL2RenderingContext.RGBA8,
            minFilter: WebGL2RenderingContext.LINEAR,
            magFilter: WebGL2RenderingContext.LINEAR,
            wrapS: WebGL2RenderingContext.REPEAT,
            wrapT: WebGL2RenderingContext.REPEAT,
            id: v4(),
          },
        })
      ).content;
    },
    async loadShader(path: string, type: "vertex" | "fragment") {
      const shaderFile = await send({
        id: v4(),
        contents: {
          type: "load-file",
          path,
        },
      });

      if (!shaderFile.content.file) return;

      const text = await shaderFile.content.file.text();

      const textWithoutVersion = text.replace(/^.*\#version 300 es/, "");

      const parsed = parseGLSLWithoutPreprocessing(textWithoutVersion);

      if (!parsed.data.success) return;

      const tu = parsed.data.data.translationUnit;

      const shader = await send({
        id: v4(),
        contents: {
          type: "create-shader",
          source: {
            shaderType: type,
            text,
            ...getInputsOutputsAndUniforms(tu),
          },
          id: v4(),
        },
      });

      return shader.content;
    },
    async createMenu<UI extends UIOption>(
      menu: UI
    ): Promise<{
      id: string;
      menu: UI;
    }> {
      const res = await send({
        id: v4(),
        contents: {
          type: "create-menu",
          menu,
          id: v4(),
        },
      });

      return res.content as any;
    },
    async pollMenu<UI extends UIOption>(
      menu: MenuRef & { menu: UI }
    ): Promise<UIReturnType<UI>> {
      const res = await send({
        id: v4(),
        contents: {
          type: "poll-menu",
          id: menu.id,
          menu,
        },
      });

      return res.content;
    },
    async getWindowSize() {
      const res = await send({
        id: v4(),
        contents: {
          type: "get-window-size",
        },
      });

      return res.content;
    },
    async resize(width: number, height: number) {
      await send({
        id: v4(),
        contents: {
          type: "resize",
          width,
          height,
        },
      });
    },
    async getPanAndZoomBounds() {
      const bounds = (
        await send({
          id: v4(),
          contents: {
            type: "get-pan-and-zoom-bounds",
          },
        })
      ).content;

      return {
        ...bounds,
        center: [
          (bounds.bottomLeft[0] + bounds.topRight[0]) / 2,
          (bounds.bottomLeft[1] + bounds.topRight[1]) / 2,
        ] as [number, number],
        dimensions: [
          bounds.topRight[0] - bounds.bottomLeft[0],
          bounds.topRight[1] - bounds.bottomLeft[1],
        ] as [number, number],
      };
    },
    async resetVideoEncoder() {
      const res = await send({
        id: v4(),
        contents: {
          type: "reset-encoder",
        },
      });
    },
    async addVideoFrame() {
      const res = await send({
        id: v4(),
        contents: {
          type: "add-frame",
        },
      });
    },
    async renderVideo(filename: string) {
      const res = await send({
        id: v4(),
        contents: {
          filename,
          type: "render-video",
        },
      });
    },
    async readFile(filename: string) {
      return (
        await send({
          id: v4(),
          contents: {
            filename,
            type: "read-file",
          },
        })
      ).content;
    },
  };
}
