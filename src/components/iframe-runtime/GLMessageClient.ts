import { v4 } from "uuid";
import {
  GLMessage,
  GLMessageResponse,
  BufferRef,
  GLPrimitive,
  ShaderRef,
} from "./GLMessageProtocol";

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
      }
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
  };
}
