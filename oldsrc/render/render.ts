import { Edge } from "@xyflow/react";
import { CustomNode } from "../components/Flow";
import { meshDataJsonParser } from "../components/MeshDataNode";
import { z } from "zod";

export type RenderState = {
  buffers: Map<
    string,
    {
      buffer: WebGLBuffer;
      format: z.infer<typeof meshDataJsonParser>;
      stride: number;
      offsets: number[];
    }
  >;
  framebuffers: Map<
    string,
    {
      framebuffer: WebGLFramebuffer;
      depthAttachment?: WebGLTexture;
      colorAttachments: WebGLTexture[];
    }
  >;
  programs: Map<string, WebGLProgram>;
};

function generateRenderState(
  nodes: CustomNode[],
  edges: Edge,
  context: {
    gl: WebGL2RenderingContext;
  }
) {
  const renderState: RenderState = {
    buffers: new Map(),
    framebuffers: new Map(),
    programs: new Map(),
  };

  const { gl } = context;

  for (const n of nodes) {
    if (n.type === "MeshDataNode") {
      if (n.data.type === "json") {
        const format = meshDataJsonParser.parse(JSON.parse(n.data.src));
        const buf = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, buf);
        const maxlen = format.reduce(
          (prev, curr) =>
            Math.max(prev, Math.ceil(curr.value.length / curr.count)),
          0
        );
        const stride = format.reduce(
          (prev, curr) => prev + (curr.count * curr.size) / 8,
          0
        );
        const offsets = format.reduce(
          (prev, curr) =>
            prev.concat([(prev.at(-1) ?? 0) + (curr.count * curr.size) / 8]),
          [] as number[]
        );
        const bufferData = new ArrayBuffer(maxlen * stride);
        const view = new DataView(bufferData);
        for (let i = 0; i < maxlen; i++) {
          const baseIndex = stride * i;
          for (let j = 0; j < format.length; j++) {
            const offset = offsets[j];
            const formatItem = format[j];

            for (let k = 0; k < formatItem.count; k++) {
              const byteOffset = baseIndex + offset + (k * formatItem.size) / 8;
              const arrayIndex = i * formatItem.size + k;
              const arrayItem = formatItem.value.at(arrayIndex) ?? 0;

              if (formatItem.encoding === "float") {
                if (formatItem.size === 32) {
                  view.setFloat32(byteOffset, arrayItem);
                } else if (formatItem.size === 16) {
                  view.setFloat16(byteOffset, arrayItem);
                }
              } else if (
                formatItem.encoding === "int" ||
                formatItem.encoding === "normalized-int"
              ) {
                if (formatItem.size === 32) {
                  view.setInt32(byteOffset, arrayItem);
                } else if (formatItem.size === 16) {
                  view.setInt16(byteOffset, arrayItem);
                } else {
                  view.setInt8(byteOffset, arrayItem);
                }
              } else {
                if (formatItem.size === 32) {
                  view.setUint32(byteOffset, arrayItem);
                } else if (formatItem.size === 16) {
                  view.setUint16(byteOffset, arrayItem);
                } else {
                  view.setUint8(byteOffset, arrayItem);
                }
              }
            }
          }
        }

        gl.bufferData(gl.ARRAY_BUFFER, bufferData, gl.STATIC_DRAW);

        renderState.buffers.set(n.id, {
          buffer: buf,
          format,
          stride,
          offsets,
        });
      }
    } else if (n.type === "RasterizerNode") {
    }
  }
}
