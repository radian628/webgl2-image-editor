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
} from "./GLMessageProtocol";
import { parseGLSLWithoutPreprocessing } from "../../glsl-analyzer/parser-combined";
import { getInputsOutputsAndUniforms } from "../../glsl-analyzer/get-inputs-outputs";

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
  };
}
