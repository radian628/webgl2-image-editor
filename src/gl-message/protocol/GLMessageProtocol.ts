import {
  UIOption,
  UIReturnType,
} from "../../components/gl-message-ui/GLMessageUI";

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

export type UniformsToValues<G extends Record<string, UniformType>> = {
  [K in keyof G]: UniformTypeValue<G[K]>;
};

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
    }
  | {
      type: "create-menu";
      id: string;
      menu: UIOption;
    }
  | {
      type: "poll-menu";
      id: string;
      menu: MenuRef;
    }
  | {
      type: "resize";
      width: number;
      height: number;
    }
  | { type: "get-window-size" }
  | { type: "get-pan-and-zoom-bounds" }
  | { type: "reset-encoder" }
  // TODO: maybe make it able to render from other targets
  | { type: "add-frame" }
  | { type: "render-video"; filename: string; audioLink?: string }
  | { type: "read-file"; filename: string }
  | {
      type: "get-shader-function-signatures";
      filename: string;
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

export type MenuRef = {
  id: string;
  menu: UIOption;
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
            : Msg extends GLMessageType<"create-menu">
              ? MenuRef
              : Msg extends GLMessageType<"poll-menu">
                ? UIReturnType<Msg["contents"]["menu"]["menu"]>
                : Msg extends GLMessageType<"get-window-size">
                  ? { width: number; height: number }
                  : Msg extends GLMessageType<"get-pan-and-zoom-bounds">
                    ? {
                        bottomLeft: [number, number];
                        topRight: [number, number];
                      }
                    : Msg extends GLMessageType<"read-file">
                      ? { file: Blob | undefined }
                      : undefined;

export type GLMessageResponse<Msg extends GLMessage> = {
  id: string;
  content: GLMessageResponseContents<Msg>;
  timestamp: number;
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
