import { FilesystemAdaptor } from "../../filesystem/FilesystemAdaptor";
import { BufferFormat } from "../../pipeline-assembler/pipeline-format";

export type GLPrimitive = {
  count: 1 | 2 | 3 | 4;
  type: "float" | "int" | "uint";
};

export type UniformType =
  | GLPrimitive
  | {
      type: "sampler";
      dimensionality: "2D" | "3D" | "2DArray" | "Cube";
      samplerType: "float" | "int" | "uint";
    }
  | {
      type: "sampler";
      samplerType: "shadow";
      dimensionality: "2D" | "2DArray" | "Cube";
    };

export type GLPrimitiveToNumber<G extends GLPrimitive> = G["count"] extends 1
  ? number
  : G["count"] extends 2
    ? [number, number]
    : G["count"] extends 3
      ? [number, number, number]
      : [number, number, number, number];

export type UniformTypeValue<G extends UniformType> = G extends GLPrimitive
  ? GLPrimitiveToNumber<G>
  : TextureRef;

function glp(count: 1 | 2 | 3 | 4, type: "float" | "int" | "uint") {
  return { count, type };
}

export function typeNameToGLPrimitive(
  typename: string
): GLPrimitive | undefined {
  return {
    float: glp(1, "float"),
    vec2: glp(2, "float"),
    vec3: glp(3, "float"),
    vec4: glp(4, "float"),
    int: glp(1, "int"),
    ivec2: glp(2, "int"),
    ivec3: glp(3, "int"),
    ivec4: glp(4, "int"),
    uint: glp(1, "uint"),
    uvec2: glp(2, "uint"),
    uvec3: glp(3, "uint"),
    uvec4: glp(4, "uint"),
  }[typename];
}

export type ShaderSource = {
  inputs: Record<string, GLPrimitive>;
  outputs: Record<string, GLPrimitive>;
  uniforms: Record<string, UniformType>;
  shaderType: "vertex" | "fragment";
  text: string;
};

export type ShaderRef<Type extends "vertex" | "fragment"> = {
  inputs: Record<string, GLPrimitive>;
  outputs: Record<string, GLPrimitive>;
  uniforms: Record<string, UniformType>;
  shaderType: Type;
  id: string;
};

export type ProgramRef = {
  inputs: Record<string, GLPrimitive>;
  outputs: Record<string, GLPrimitive>;
  uniforms: Record<string, UniformType>;
  id: string;
};

export type TextureDimension = {
  type: "dynamic";
  pixels: number;
};

export type TextureRef = {
  id: string;
  width: TextureDimension;
  height: TextureDimension;
  dimensionality: "2D" | "3D" | "2DArray" | "Cube";
  format: "float" | "int" | "uint";
};

export type GLMessageContents =
  | {
      type: "clear";
      color?: [number, number, number, number];
      depth?: number;
      stencil?: number;
    }
  | {
      type: "create-buffer";
      id: string;
      source: {
        type: "array";
        spec: InterleavedBufferSpec;
      };
    }
  | {
      type: "create-shader";
      source: ShaderSource;
      id: string;
    }
  | {
      type: "create-program";
      vertex: ShaderRef<"vertex">;
      fragment: ShaderRef<"fragment">;
      id: string;
    }
  | {
      type: "draw";
      program: ProgramRef;
      inputs: Record<string, BufferInputRef>;
      outputs: Record<string, TextureRef | null>;
      uniforms: Record<string, number | number[] | TextureRef>;
      count: number;
    }
  | {
      type: "load-file";
      path: string;
    }
  | {
      type: "create-texture";
      pixels?: ArrayBuffer;
      width: number;
      height: number;
      depth?: number;
      internalformat: GLenum;
      minFilter: GLenum;
      magFilter: GLenum;
      wrapS: GLenum;
      wrapT: GLenum;
      id: string;
    };

export type GLMessageContentsType<T extends GLMessageContents["type"]> =
  GLMessageContents & { type: T };

export type GLMessageType<T extends GLMessageContents["type"]> = {
  id: string;
  contents: GLMessageContentsType<T>;
};

export type GLMessage = {
  contents: GLMessageContents;
  id: string;
};

export type GLMessageResponseContents<Msg extends GLMessage> =
  Msg extends GLMessageType<"create-buffer">
    ? { spec: Msg["contents"]["source"]["spec"]; id: string }
    : Msg extends GLMessageType<"create-shader">
      ? {
          inputs: Msg["contents"]["source"]["inputs"];
          outputs: Msg["contents"]["source"]["outputs"];
          uniforms: Msg["contents"]["source"]["uniforms"];
          shaderType: Msg["contents"]["source"]["shaderType"];
          id: Msg["contents"]["id"];
        }
      : Msg extends GLMessageType<"create-program">
        ? {
            inputs: Msg["contents"]["vertex"]["inputs"];
            outputs: Msg["contents"]["fragment"]["outputs"];
            uniforms: Msg["contents"]["vertex"]["uniforms"] &
              Msg["contents"]["fragment"]["uniforms"];
            id: Msg["contents"]["id"];
          }
        : Msg extends GLMessageType<"load-file">
          ? {
              file: Blob | undefined;
            }
          : Msg extends GLMessageType<"create-texture">
            ? TextureRef
            : undefined;

export type GLMessageResponse<Msg extends GLMessage> = {
  id: string;
  content: GLMessageResponseContents<Msg>;
};

export type GLMessageContext = {
  gl: WebGL2RenderingContext;
  buffers: Map<string, WebGLBuffer>;
  shaders: Map<string, WebGLShader>;
  programs: Map<string, WebGLProgram>;
  textures: Map<string, WebGLTexture>;
  fs: FilesystemAdaptor;
  canvas: HTMLCanvasElement;
};

export type InterleavedBufferSpec = {
  count: 1 | 2 | 3 | 4;
  size: 8 | 16 | 32;
  encoding: "int" | "normalized-int" | "float" | "uint" | "normalized-uint";
  value: number[];
  name: string;
  stride: number;
  offset: number;
}[];

export type BufferRef = {
  spec: InterleavedBufferSpec;
  id: string;
};

export type BufferInputRef = {
  buffer: BufferRef;
  inputName: string;
};

function createInterleavedBuffer(
  gl: WebGL2RenderingContext,
  format: InterleavedBufferSpec
) {
  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  const maxlen = format.reduce(
    (prev, curr) => Math.max(prev, Math.ceil(curr.value.length / curr.count)),
    0
  );
  const stride = format.reduce(
    (prev, curr) => prev + (curr.count * curr.size) / 8,
    0
  );
  const offsets = format.reduce(
    (prev, curr) => prev.concat([prev.at(-1)! + (curr.count * curr.size) / 8]),
    [0] as number[]
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
        const arrayIndex = i * formatItem.count + k;
        const arrayItem = formatItem.value.at(arrayIndex) ?? 0;

        if (formatItem.encoding === "float") {
          if (formatItem.size === 32) {
            view.setFloat32(byteOffset, arrayItem, true);
          } else if (formatItem.size === 16) {
            view.setFloat16(byteOffset, arrayItem, true);
          }
        } else if (
          formatItem.encoding === "int" ||
          formatItem.encoding === "normalized-int"
        ) {
          if (formatItem.size === 32) {
            view.setInt32(byteOffset, arrayItem, true);
          } else if (formatItem.size === 16) {
            view.setInt16(byteOffset, arrayItem, true);
          } else {
            view.setInt8(byteOffset, arrayItem);
          }
        } else {
          if (formatItem.size === 32) {
            view.setUint32(byteOffset, arrayItem, true);
          } else if (formatItem.size === 16) {
            view.setUint16(byteOffset, arrayItem, true);
          } else {
            view.setUint8(byteOffset, arrayItem);
          }
        }
      }
    }
  }

  gl.bufferData(gl.ARRAY_BUFFER, bufferData, gl.STATIC_DRAW);
  return buf;
}

function getVertexArrayType(
  gl: WebGL2RenderingContext,
  size: 8 | 16 | 32,
  encoding: "float" | "int" | "uint" | "normalized-int" | "normalized-uint"
) {
  return {
    8: {
      float: gl.BYTE,
      int: gl.BYTE,
      "normalized-int": gl.BYTE,
      uint: gl.UNSIGNED_BYTE,
      "normalized-uint": gl.UNSIGNED_BYTE,
    },

    16: {
      float: gl.HALF_FLOAT,
      int: gl.SHORT,
      "normalized-int": gl.SHORT,
      uint: gl.UNSIGNED_SHORT,
      "normalized-uint": gl.UNSIGNED_SHORT,
    },
    32: {
      float: gl.FLOAT,
      int: gl.INT,
      "normalized-int": gl.INT,
      uint: gl.UNSIGNED_INT,
      "normalized-uint": gl.UNSIGNED_INT,
    },
  }[size][encoding];
}

export async function executeGLMessage<Msg extends GLMessage>(
  msgwrapper: Msg,
  context: GLMessageContext
): Promise<GLMessageResponse<Msg>> {
  // @ts-expect-error
  if (!msgwrapper.contents) return;
  const msg = msgwrapper.contents;
  const { gl } = context;
  if (msg.type === "clear") {
    const bitfield =
      (msg.color ? gl.COLOR_BUFFER_BIT : 0) |
      (msg.depth ? gl.DEPTH_BUFFER_BIT : 0) |
      (msg.stencil ? gl.STENCIL_BUFFER_BIT : 0);
    if (msg.color) gl.clearColor(...msg.color);
    if (msg.depth) gl.clearDepth(msg.depth);
    if (msg.stencil) gl.clearStencil(msg.stencil);
    gl.clear(bitfield);
    // @ts-expect-error
    return {
      id: msgwrapper.id,
    };
  } else if (msg.type === "create-buffer") {
    if (msg.source.type === "array") {
      const buf = createInterleavedBuffer(gl, msg.source.spec);
      context.buffers.set(msg.id, buf);
    }
    return {
      // @ts-expect-error
      content: { spec: msg.source.spec, id: msg.id },
      id: msgwrapper.id,
    };
  } else if (msg.type === "create-shader") {
    const shader = gl.createShader(
      msg.source.shaderType === "vertex" ? gl.VERTEX_SHADER : gl.FRAGMENT_SHADER
    )!;
    gl.shaderSource(shader, msg.source.text);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      console.error(gl.getShaderInfoLog(shader));
    }
    context.shaders.set(msg.id, shader);
    return {
      // @ts-expect-error
      content: {
        inputs: msg.source.inputs,
        outputs: msg.source.outputs,
        uniforms: msg.source.uniforms,
        shaderType: msg.source.shaderType,
        id: msg.id,
      },
      id: msgwrapper.id,
    };
  } else if (msg.type === "create-program") {
    const program = gl.createProgram();
    gl.attachShader(program, context.shaders.get(msg.vertex.id)!);
    gl.attachShader(program, context.shaders.get(msg.fragment.id)!);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error(gl.getProgramInfoLog(program));
    }
    context.programs.set(msg.id, program);
    return {
      // @ts-expect-error
      content: {
        inputs: msg.vertex.inputs,
        outputs: msg.fragment.outputs,
        uniforms: {
          ...msg.vertex.uniforms,
          ...msg.fragment.uniforms,
        },
        id: msg.id,
      },
      id: msgwrapper.id,
    };
  } else if (msg.type === "draw") {
    const program = context.programs.get(msg.program.id)!;
    gl.useProgram(program);

    for (const [name, type] of Object.entries(msg.program.inputs)) {
      const bufferRef = msg.inputs[name];
      const buf = context.buffers.get(bufferRef.buffer.id)!;
      const input = bufferRef.buffer.spec.find(
        (s) => bufferRef.inputName === s.name
      )!;
      gl.bindBuffer(gl.ARRAY_BUFFER, buf);
      const location = gl.getAttribLocation(program, name);
      gl.enableVertexAttribArray(location);
      if (
        input.encoding === "float" ||
        input.encoding === "normalized-int" ||
        input.encoding === "normalized-uint"
      ) {
        gl.vertexAttribPointer(
          location,
          input.count,
          getVertexArrayType(gl, input.size, input.encoding),
          input.encoding.startsWith("normalized"),
          input.stride,
          input.offset
        );
      } else if (input.encoding === "int" || input.encoding === "uint") {
        gl.vertexAttribIPointer(
          location,
          input.count,
          getVertexArrayType(gl, input.size, input.encoding),
          input.stride,
          input.offset
        );
      }
    }

    if (
      Object.entries(msg.program.outputs).length > 1 ||
      msg.outputs[Object.keys(msg.program.outputs)?.[0]!]
    ) {
      console.log("USING FRAMEBUFFER", msg);
      const fbo = gl.createFramebuffer();
      gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);

      const outputs = Object.entries(msg.program.outputs);

      for (const [name, type] of outputs) {
        const textureRef = msg.outputs[name];
        if (textureRef === null) continue;
        gl.viewport(0, 0, textureRef.width.pixels, textureRef.height.pixels);
        const location = gl.getFragDataLocation(program, name);
        const tex = context.textures.get(textureRef.id)!;
        gl.bindTexture(gl.TEXTURE_2D, tex);
        gl.framebufferTexture2D(
          gl.FRAMEBUFFER,
          gl.COLOR_ATTACHMENT0 + location,
          gl.TEXTURE_2D,
          tex,
          0
        );
      }

      gl.drawBuffers(outputs.map((e, i) => gl.COLOR_ATTACHMENT0 + i));
    } else {
      gl.viewport(0, 0, context.canvas.width, context.canvas.height);
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    }

    const textureBindings = new Map<WebGLTexture, number>();
    let bindingIndex = 0;

    for (const [name, type] of Object.entries(msg.program.uniforms)) {
      if (type.type !== "sampler") continue;
      let uniformData = msg.uniforms[name] as TextureRef;
      const tex = context.textures.get(uniformData.id)!;
      let binding = textureBindings.get(tex);
      if (!binding) {
        gl.activeTexture(gl.TEXTURE0 + bindingIndex);
        // TODO: support other types of textures
        gl.bindTexture(gl.TEXTURE_2D, tex);
        textureBindings.set(tex, bindingIndex);
        binding = bindingIndex;
        bindingIndex++;
      }

      const loc = gl.getUniformLocation(program, name);
      gl.uniform1i(loc, binding);
    }

    for (const [name, type] of Object.entries(msg.program.uniforms)) {
      if (type.type === "sampler") continue;
      let uniformData = msg.uniforms[name];
      if (!Array.isArray(uniformData)) uniformData = [uniformData as number];
      const loc = gl.getUniformLocation(program, name);

      console.log(name, type, uniformData);

      let uniformFunc: keyof typeof gl = (
        {
          float: {
            1: "uniform1f",
            2: "uniform2f",
            3: "uniform3f",
            4: "uniform4f",
          },
          int: {
            1: "uniform1i",
            2: "uniform2i",
            3: "uniform3i",
            4: "uniform4i",
          },
          uint: {
            1: "uniform1ui",
            2: "uniform2i",
            3: "uniform3ui",
            4: "uniform4ui",
          },
        } as const
      )[type.type][type.count];

      // @ts-expect-error
      gl[uniformFunc](loc, ...uniformData);
    }

    gl.drawArrays(gl.TRIANGLES, 0, msg.count);
    // @ts-expect-error
    return {
      id: msgwrapper.id,
    };
  } else if (msg.type === "load-file") {
    const file = await context.fs.readFile(msg.path);
    return {
      id: msgwrapper.id,
      // @ts-expect-error
      content: {
        file,
      },
    };
  } else if (msg.type === "create-texture") {
    const tex = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.texImage2D(
      gl.TEXTURE_2D,
      0,
      msg.internalformat,
      msg.width,
      msg.height,
      0,
      gl.RGBA,
      gl.UNSIGNED_BYTE,
      msg.pixels ? new Uint8Array(msg.pixels) : null
    );
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, msg.minFilter);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, msg.magFilter);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, msg.wrapS);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, msg.wrapT);
    context.textures.set(msg.id, tex);
    return {
      id: msgwrapper.id,
      // @ts-expect-error
      content: {
        id: msg.id,
        width: { pixels: msg.width },
        height: { pixels: msg.height },
        dimensionality: "2D",
        format: "float",
      },
    };
  }

  // @ts-expect-error
  return;
}
