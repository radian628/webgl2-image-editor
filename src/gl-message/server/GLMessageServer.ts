import {
  Output,
  CanvasSource,
  BufferTarget,
  Mp4OutputFormat,
  getFirstEncodableVideoCodec,
  QUALITY_HIGH,
} from "mediabunny";
import {
  UIOption,
  getGLMessageUIDefaultValue,
} from "../../components/gl-message-ui/GLMessageUI";
import { FilesystemAdaptor } from "../../filesystem/fs-protocol/FilesystemAdaptor";
import { makeGLSLLanguageServer } from "../../languages/glsl/langsupport/glsl-language-server";
import {
  BufferInputRef,
  GLMessage,
  GLMessageResponse,
  GLPrimitive,
  InterleavedBufferSpec,
  MenuRef,
  ProgramRef,
  ShaderRef,
  ShaderSource,
  TextureRef,
} from "../protocol/GLMessageProtocol";

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

export type GLMessageContext = {
  gl: WebGL2RenderingContext;
  buffers: Map<string, WebGLBuffer>;
  shaders: Map<string, WebGLShader>;
  programs: Map<string, WebGLProgram>;
  textures: Map<string, WebGLTexture>;
  menus: { current: Map<string, { spec: UIOption; value: any }> };
  fs: FilesystemAdaptor;
  canvas: HTMLCanvasElement;
  container: { current: HTMLElement | null };
  zoomPan: {
    current: {
      bottomLeft: [number, number];
      topRight: [number, number];
    };
  };
  // getffmpeg: () => Promise<FFmpeg>;
  // ffmpegFrameCount: { current: number };
  videoRef: {
    current: {
      output: Output;
      canvasSource: CanvasSource;
      frameIndex: number;
      framerate: number;
    };
  };
  setMenuValues: (
    cb: (
      values: Record<string, { spec: UIOption; value: any }>
    ) => Record<string, { spec: UIOption; value: any }>
  ) => void;
};

export function createGLMessageExecutor(ctx: GLMessageContext) {
  const { gl } = ctx;
  return {
    clear(
      color?: [number, number, number, number],
      depth?: number,
      stencil?: number
    ) {
      const bitfield =
        (color ? gl.COLOR_BUFFER_BIT : 0) |
        (depth ? gl.DEPTH_BUFFER_BIT : 0) |
        (stencil ? gl.STENCIL_BUFFER_BIT : 0);
      if (color) gl.clearColor(...color);
      if (depth) gl.clearDepth(depth);
      if (stencil) gl.clearStencil(stencil);
      gl.clear(bitfield);
    },

    createBuffer(
      id: string,
      msg: {
        source: {
          type: "array";
          spec: InterleavedBufferSpec;
        };
      }
    ) {
      if (msg.source.type === "array") {
        const buf = createInterleavedBuffer(gl, msg.source.spec);
        ctx.buffers.set(id, buf);
      }
      return {
        spec: msg.source.spec,
        id: id,
      };
    },

    createShader(id: string, source: ShaderSource) {
      const shader = gl.createShader(
        source.shaderType === "vertex" ? gl.VERTEX_SHADER : gl.FRAGMENT_SHADER
      )!;
      gl.shaderSource(shader, source.text);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error(gl.getShaderInfoLog(shader));
      }
      ctx.shaders.set(id, shader);
      return {
        inputs: source.inputs,
        outputs: source.outputs,
        uniforms: source.uniforms,
        shaderType: source.shaderType,
        id: id,
      };
    },

    createProgram(
      id: string,
      vertex: ShaderRef<"vertex">,
      fragment: ShaderRef<"fragment">
    ) {
      const program = gl.createProgram();
      gl.attachShader(program, ctx.shaders.get(vertex.id)!);
      gl.attachShader(program, ctx.shaders.get(fragment.id)!);
      gl.linkProgram(program);
      if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        console.error(gl.getProgramInfoLog(program));
      }
      ctx.programs.set(id, program);
      return {
        inputs: vertex.inputs,
        outputs: fragment.outputs,
        uniforms: {
          ...vertex.uniforms,
          ...fragment.uniforms,
        },
        id: id,
      };
    },

    draw(msg: {
      program: ProgramRef;
      inputs: Record<string, BufferInputRef>;
      outputs: Record<string, TextureRef | null>;
      uniforms: Record<string, number | number[] | TextureRef>;
      count: number;
    }) {
      const program = ctx.programs.get(msg.program.id)!;
      gl.useProgram(program);

      for (const [name, type] of Object.entries(msg.program.inputs)) {
        const bufferRef = msg.inputs[name];
        const buf = ctx.buffers.get(bufferRef.buffer.id)!;
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
        const fbo = gl.createFramebuffer();
        gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);

        const outputs = Object.entries(msg.program.outputs);

        for (const [name, type] of outputs) {
          const textureRef = msg.outputs[name];
          if (textureRef === null) continue;
          gl.viewport(0, 0, textureRef.width.pixels, textureRef.height.pixels);
          const location = gl.getFragDataLocation(program, name);
          const tex = ctx.textures.get(textureRef.id)!;
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
        gl.viewport(0, 0, ctx.canvas.width, ctx.canvas.height);
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      }

      const textureBindings = new Map<WebGLTexture, number>();
      let bindingIndex = 0;

      for (const [name, type] of Object.entries(msg.program.uniforms)) {
        if (type.type !== "sampler") continue;
        let uniformData = msg.uniforms[name] as TextureRef;
        const tex = ctx.textures.get(uniformData.id)!;
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
    },

    async loadFile(path: string) {
      const file = await ctx.fs.readFile(path);
      return {
        file,
      };
    },

    createTexture(
      id: string,
      msg: {
        pixels?: ArrayBuffer;
        width: number;
        height: number;
        depth?: number;
        internalformat: GLenum;
        minFilter: GLenum;
        magFilter: GLenum;
        wrapS: GLenum;
        wrapT: GLenum;
      }
    ) {
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
      ctx.textures.set(id, tex);

      return {
        id,
        width: { pixels: msg.width },
        height: { pixels: msg.height },
        dimensionality: "2D",
        format: "float",
      };
    },

    createMenu<UI extends UIOption>(
      id: string,
      menu: UI
    ): { menu: UI; id: string } {
      ctx.menus.current.set(id, {
        spec: menu,
        value: getGLMessageUIDefaultValue(menu),
      });
      ctx.setMenuValues((values) => ({
        ...Object.fromEntries(ctx.menus.current.entries()),
        ...values,
      }));
      return {
        id,
        menu,
      };
    },

    pollMenu(id: string) {
      return ctx.menus.current.get(id)?.value;
    },

    resize(width: number, height: number) {
      if (ctx.canvas.width !== width) ctx.canvas.width = width;
      if (ctx.canvas.height !== height) ctx.canvas.height = height;
    },

    getWindowSize() {
      const containerDims = ctx.container.current?.getBoundingClientRect() ?? {
        width: 1,
        height: 1,
      };
      return {
        width: Math.ceil(containerDims.width),
        height: Math.ceil(containerDims.height),
      };
    },

    getPanAndZoomBounds() {
      return ctx.zoomPan.current;
    },

    async resetEncoder() {
      const v = ctx.videoRef.current;
      v.output = new Output({
        target: new BufferTarget(),
        format: new Mp4OutputFormat(),
      });
      const videoCodec = await getFirstEncodableVideoCodec(
        v.output.format.getSupportedVideoCodecs(),
        {
          width: ctx.canvas.width,
          height: ctx.canvas.height,
        }
      );
      if (!videoCodec) {
        // TODO: find a better way of doing this
        throw new Error("cannot render video :(");
      }
      v.canvasSource = new CanvasSource(ctx.canvas, {
        codec: videoCodec,
        bitrate: QUALITY_HIGH,
      });
      v.output.addVideoTrack(v.canvasSource, { frameRate: 30 });
      v.frameIndex = 0;
      v.framerate = 30;
      await v.output.start();
    },

    async addFrame() {
      const v = ctx.videoRef.current;
      const timestamp = v.frameIndex / v.framerate;
      await v.canvasSource.add(timestamp, 1 / v.framerate);
      v.frameIndex++;
    },

    async renderVideo(filename: string, backingTrack?: string) {
      const v = ctx.videoRef.current;
      await v.canvasSource.close();
      await v.output.finalize();

      const videoBlob = new Blob([(v.output.target as BufferTarget).buffer!], {
        type: "video/mp4",
      });
      download(videoBlob, filename);
    },
  };
}

function download(file: Blob, filename: string) {
  const url = URL.createObjectURL(file);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}
