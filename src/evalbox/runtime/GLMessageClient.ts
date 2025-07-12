import { v4 } from "uuid";
import {
  BufferInputRef,
  GLMessage,
  GLMessageResponse,
  GLPrimitive,
  MenuRef,
  ProgramRef,
  ShaderRef,
  TextureRef,
  UniformTypeValue,
} from "../../gl-message/protocol/GLMessageProtocol";
import { parseGLSLWithoutPreprocessing } from "../../languages/glsl/parser/parser-combined";
import { getInputsOutputsAndUniforms } from "../../languages/glsl/typechecker/get-inputs-outputs";
import {
  UIOption,
  UIReturnType,
} from "../../components/gl-message-ui/GLMessageUI";
import { WorkerifyInterface } from "../../utilities/workerify/workerify";
import { createGLMessageExecutor } from "../../gl-message/server/GLMessageServer";

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
  glm: WorkerifyInterface<ReturnType<typeof createGLMessageExecutor>>
) {
  return {
    clear(
      color?: [number, number, number, number],
      depth?: number,
      stencil?: number
    ) {
      return glm.clear(color, depth, stencil);
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

      return await glm.createBuffer(v4(), {
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
      });
    },
    async linkProgram<VertexOutsFragIns extends Record<string, GLPrimitive>>(
      vertex: ShaderRef<"vertex"> & { outputs: VertexOutsFragIns },
      fragment: ShaderRef<"fragment"> & { inputs: VertexOutsFragIns }
    ) {
      return await glm.createProgram(v4(), vertex, fragment);
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
      return await glm.draw({ program, inputs, outputs, uniforms, count });
    },
    async create8BitRGBATexture(
      pixels: ArrayBuffer | undefined,
      width: number,
      height: number
    ) {
      return await glm.createTexture(v4(), {
        pixels,
        width,
        height,
        internalformat: WebGL2RenderingContext.RGBA8,
        minFilter: WebGL2RenderingContext.LINEAR,
        magFilter: WebGL2RenderingContext.LINEAR,
        wrapS: WebGL2RenderingContext.REPEAT,
        wrapT: WebGL2RenderingContext.REPEAT,
      });
    },
    async loadShader(path: string, type: "vertex" | "fragment") {
      const shaderFile = await glm.loadFile(path);

      if (!shaderFile.file) return;

      const text = await shaderFile.file.text();

      const textWithoutVersion = text.replace(/^.*\#version 300 es/, "");

      const parsed = parseGLSLWithoutPreprocessing(textWithoutVersion);

      if (!parsed.data.success) return;

      const tu = parsed.data.data.translationUnit;

      const shader = await glm.createShader(v4(), {
        shaderType: type,
        text,
        ...getInputsOutputsAndUniforms(tu),
      });

      return shader;
    },
    async createMenu<UI extends UIOption>(
      menu: UI
    ): Promise<{
      id: string;
      menu: UI;
    }> {
      return (await glm.createMenu(v4(), menu)) as { id: string; menu: UI };
    },
    async pollMenu<UI extends UIOption>(
      menu: MenuRef & { menu: UI }
    ): Promise<UIReturnType<UI>> {
      return await glm.pollMenu(menu.id);
    },
    async getWindowSize() {
      return await glm.getWindowSize();
    },
    async resize(width: number, height: number) {
      return await glm.resize(width, height);
    },
    async getPanAndZoomBounds() {
      const bounds = await glm.getPanAndZoomBounds();

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
      // const res = await send({
      //   id: v4(),
      //   contents: {
      //     type: "reset-encoder",
      //   },
      // });
      return await glm.resetEncoder();
    },
    async addVideoFrame() {
      return await glm.addFrame();
    },
    async renderVideo(filename: string, audioLink?: string) {
      return await glm.renderVideo(filename, audioLink);
    },
    async readFile(filename: string) {
      // return (
      //   await send({
      //     id: v4(),
      //     contents: {
      //       filename,
      //       type: "read-file",
      //     },
      //   })
      // ).content;
      return await glm.loadFile(filename);
    },
    async loadShaderSource(filename: string) {
      return;
    },
  };
}
