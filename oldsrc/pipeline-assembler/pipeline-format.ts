type ID = string;

type GL = WebGL2RenderingContext;

export type GLSLFunctionNode = {
  type: "glsl";
  id: ID;
  incoming: {
    from: ID;
    slot: string;
  }[];
  outgoing: {
    from: ID;
    slot: string;
  };
  src: string;
  functionName: string;
};

export type TextureFormat = {
  format:
    | GL["R8"]
    | GL["R8_SNORM"]
    | GL["RG8"]
    | GL["RG8_SNORM"]
    | GL["RGB8"]
    | GL["RGB8_SNORM"]
    | GL["RGB565"]
    | GL["RGBA4"]
    | GL["RGB5_A1"]
    | GL["RGBA8"]
    | GL["RGBA8_SNORM"]
    | GL["RGB10_A2"]
    | GL["RGB10_A2UI"]
    | GL["SRGB8"]
    | GL["SRGB8_ALPHA8"]
    | GL["R16F"]
    | GL["RG16F"]
    | GL["RGB16F"]
    | GL["RGBA16F"]
    | GL["R32F"]
    | GL["RG32F"]
    | GL["RGB32F"]
    | GL["RGBA32F"]
    | GL["R11F_G11F_B10F"]
    | GL["RGB9_E5"]
    | GL["R8I"]
    | GL["R8UI"]
    | GL["R16I"]
    | GL["R16UI"]
    | GL["R32I"]
    | GL["R32UI"]
    | GL["RG8I"]
    | GL["RG8UI"]
    | GL["RG16I"]
    | GL["RG16UI"]
    | GL["RG32I"]
    | GL["RG32UI"]
    | GL["RGB8I"]
    | GL["RGB8UI"]
    | GL["RGB16I"]
    | GL["RGB16UI"]
    | GL["RGB32I"]
    | GL["RGB32UI"]
    | GL["RGBA8I"]
    | GL["RGBA8UI"]
    | GL["RGBA16I"]
    | GL["RGBA16UI"]
    | GL["RGBA32I"]
    | GL["RGBA32UI"];
  width: number;
  height: number;
  type:
    | GL["UNSIGNED_BYTE"]
    | GL["UNSIGNED_SHORT_5_6_5"]
    | GL["UNSIGNED_SHORT_4_4_4_4"]
    | GL["UNSIGNED_SHORT_5_5_5_1"]
    | GL["UNSIGNED_SHORT"]
    | GL["UNSIGNED_INT"]
    | GL["BYTE"]
    | GL["UNSIGNED_SHORT"]
    | GL["SHORT"]
    | GL["INT"]
    | GL["HALF_FLOAT"]
    | GL["FLOAT"]
    | GL["UNSIGNED_INT_2_10_10_10_REV"]
    | GL["UNSIGNED_INT_10F_11F_11F_REV"]
    | GL["UNSIGNED_INT_5_9_9_9_REV"]
    | GL["UNSIGNED_INT_24_8"]
    | GL["FLOAT_32_UNSIGNED_INT_24_8_REV"];
};

export type FramebufferNode = {
  type: "framebuffer";
  id: ID;
  // TODO: figure this out
  attachments: {
    attachment:
      | GL["COLOR_ATTACHMENT0"]
      | GL["COLOR_ATTACHMENT1"]
      | GL["COLOR_ATTACHMENT2"]
      | GL["COLOR_ATTACHMENT3"]
      | GL["COLOR_ATTACHMENT4"]
      | GL["COLOR_ATTACHMENT5"]
      | GL["COLOR_ATTACHMENT6"]
      | GL["COLOR_ATTACHMENT7"]
      | GL["COLOR_ATTACHMENT8"]
      | GL["COLOR_ATTACHMENT9"]
      | GL["COLOR_ATTACHMENT10"]
      | GL["COLOR_ATTACHMENT11"]
      | GL["COLOR_ATTACHMENT12"]
      | GL["COLOR_ATTACHMENT13"]
      | GL["COLOR_ATTACHMENT14"]
      | GL["COLOR_ATTACHMENT15"]
      | GL["DEPTH_ATTACHMENT"]
      | GL["STENCIL_ATTACHMENT"]
      | GL["DEPTH_STENCIL_ATTACHMENT"];
    texture: TextureFormat;
  }[];
};

export type BufferVectorArray =
  | {
      type: "float";
      size: 1 | 2 | 3 | 4;
      datatype:
        | GL["BYTE"]
        | GL["SHORT"]
        | GL["UNSIGNED_BYTE"]
        | GL["UNSIGNED_SHORT"]
        | GL["FLOAT"]
        | GL["HALF_FLOAT"]
        | GL["INT"]
        | GL["UNSIGNED_INT"]
        | GL["INT_2_10_10_10_REV"]
        | GL["UNSIGNED_INT_2_10_10_10_REV"];
      normalized: boolean;
      stride: GLsizei;
      offset: GLintptr;
    }
  | {
      type: "int";
      size: 1 | 2 | 3 | 4;
      datatype:
        | GL["BYTE"]
        | GL["UNSIGNED_BYTE"]
        | GL["SHORT"]
        | GL["UNSIGNED_SHORT"]
        | GL["INT"]
        | GL["UNSIGNED_INT"];
      stride: GLsizei;
      offset: GLintptr;
    };

export type BufferFormat = BufferVectorArray[];

export type GeometryNode = {
  type: "geometry";
  id: ID;
  buffers: BufferFormat[];
};

export type RasterizerNode = {
  type: "rasterizer";
  id: ID;
  inputs: {
    id: ID;
    index: number;
  }[];
  indices?: ID;
};

export type RenderState = {
  buffers: Map<number, WebGLBuffer>;
  textures: Map<number, WebGLTexture>;
  framebuffers: Map<number, WebGLFramebuffer | null>;
};
