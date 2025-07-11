var e={type:"dir",contents:new Map([["src",{type:"dir",contents:new Map([["components",{type:"dir",contents:new Map([["input-fields",{type:"dir",contents:new Map([["NumberField.d.ts",{type:"file",contents:new Blob([`type NumberInputProps = {
    setValue: (x: number) => void;
    value: number;
    options: {
        stepSize: number;
        min: number;
        max: number;
        sensitivity: number;
    };
};
export declare function NumberField(props: NumberInputProps): any;
export {};
`])}]])}],["gl-message-ui",{type:"dir",contents:new Map([["GLMessageUI.d.ts",{type:"file",contents:new Blob([`import "./GLMessageUI.css";
export type UIOptionMenu = {
    type: "menu";
    name?: string;
    desc?: string;
    fields: Record<string, UIOption>;
};
export type UIOptionNumerical = {
    type: "number";
    min?: number;
    max?: number;
    step?: number;
    scaling?: "linear" | "log";
    sensitivity?: number;
} & ({
    count: 1 | 2 | 3 | 4;
    format?: "number" | "slider";
} | {
    count: 2;
    format?: "position";
}) & ({
    count: 1;
    defaultValue: number;
} | {
    count: 2;
    defaultValue: [number, number];
} | {
    count: 3;
    defaultValue: [number, number, number];
} | {
    count: 4;
    defaultValue: [number, number, number, number];
});
export type UIOptionOrbitControls = {
    type: "orbit";
};
export type UIOptionFirstPersonControls = {
    type: "first-person";
};
export type UIOptionPanZoomControls = {
    type: "pan-zoom";
    defaultBottomLeft: [number, number];
    defaultTopRight: [number, number];
    step?: number;
    min?: number;
    max?: number;
    sensitivity?: number;
};
export type UIOptionSelect<K extends string> = {
    type: "select";
    options: Record<K, UIOption>;
    defaultOption: K;
};
export type Matrix4x4 = [
    number,
    number,
    number,
    number,
    number,
    number,
    number,
    number,
    number,
    number,
    number,
    number,
    number,
    number,
    number,
    number
];
export type UIOption = UIOptionMenu | UIOptionNumerical;
export type UIReturnType<T extends UIOption> = T extends UIOptionMenu ? {
    [Key in keyof T["fields"]]: UIReturnType<T["fields"][Key]>;
} : T extends UIOptionNumerical ? T["count"] extends 1 ? number : T["count"] extends 2 ? [number, number] : T["count"] extends 3 ? [number, number, number] : T["count"] extends 4 ? [number, number, number, number] : never : T extends UIOptionOrbitControls ? {
    transform: Matrix4x4;
} : T extends UIOptionFirstPersonControls ? {
    transform: Matrix4x4;
} : T extends UIOptionSelect<string> ? {
    [K in keyof T["options"]]: {
        type: K;
        value: T["options"][K];
    };
}[keyof T["options"]] : T extends UIOptionPanZoomControls ? {
    bottomLeft: [number, number];
    topRight: [number, number];
} : never;
export type UniformSpec = {
    type: "float" | "int" | "uint";
    count: 1 | 2 | 3 | 4;
};
export type ShaderInputOutputSpec = {
    type: "float" | "int" | "uint";
    count: 1 | 2 | 3 | 4;
};
export type ShaderSpec = {
    uniforms: Record<string, UniformSpec>;
    inputs: Record<string, ShaderInputOutputSpec>;
    outputs: Record<string, ShaderInputOutputSpec>;
};
export type RenderTargetSpec = Record<string, ShaderInputOutputSpec>;
export type GLMessageUIExternalContext = {
    panBottomLeft: [number, number];
    panTopRight: [number, number];
};
type GLMessageUIProps<UI extends UIOption> = {
    template: UI;
    value: UIReturnType<UI>;
    setValue: (f: (oldValue: UIReturnType<UI>) => UIReturnType<UI>) => void;
};
export declare function GLMessageUIField<UI extends UIOption>(props: GLMessageUIProps<UI>): any;
export declare function getGLMessageUIDefaultValue<UI extends UIOption>(ui: UI): UIReturnType<UI>;
export {};
`])}]])}]])}],["evalbox",{type:"dir",contents:new Map([["runtime",{type:"dir",contents:new Map([["EvalboxUIWrapper.d.ts",{type:"file",contents:new Blob([`import { UIOption } from "../../components/gl-message-ui/GLMessageUI";
export type FloatOptions = {
    min?: number;
    max?: number;
    step?: number;
    sensitivity?: number;
    scaling?: "linear" | "log";
};
export type IntOptions = {
    min?: number;
    max?: number;
    sensitivity?: number;
    scaling?: "linear" | "log";
};
export declare const ui: {
    menu<F extends Record<string, UIOption>>(name: string, fields: F, desc: string): {
        readonly type: "menu";
        readonly fields: F;
        readonly desc: string;
    };
    float(defaultValue: number, options?: FloatOptions): {
        min: any;
        max: any;
        step: number;
        sensitivity: number;
        scaling: "linear" | "log";
        readonly type: "number";
        readonly count: 1;
        readonly defaultValue: number;
    };
    vec2(defaultValue: [number, number], options?: FloatOptions): {
        min: any;
        max: any;
        step: number;
        sensitivity: number;
        scaling: "linear" | "log";
        readonly type: "number";
        readonly count: 2;
        readonly defaultValue: [number, number];
    };
    vec3(defaultValue: [number, number, number], options?: FloatOptions): {
        min: any;
        max: any;
        step: number;
        sensitivity: number;
        scaling: "linear" | "log";
        readonly type: "number";
        readonly count: 3;
        readonly defaultValue: [number, number, number];
    };
    vec4(defaultValue: [number, number, number, number], options?: FloatOptions): {
        min: any;
        max: any;
        step: number;
        sensitivity: number;
        scaling: "linear" | "log";
        readonly type: "number";
        readonly count: 4;
        readonly defaultValue: [number, number, number, number];
    };
    int(defaultValue: number, options?: IntOptions): {
        min: any;
        max: any;
        sensitivity: number;
        scaling: "linear" | "log";
        readonly type: "number";
        readonly step: 1;
        readonly count: 1;
        readonly defaultValue: number;
    };
    ivec2(defaultValue: [number, number], options?: IntOptions): {
        min: any;
        max: any;
        sensitivity: number;
        scaling: "linear" | "log";
        readonly type: "number";
        readonly step: 1;
        readonly count: 2;
        readonly defaultValue: [number, number];
    };
    ivec3(defaultValue: [number, number, number], options?: IntOptions): {
        min: any;
        max: any;
        sensitivity: number;
        scaling: "linear" | "log";
        readonly type: "number";
        readonly step: 1;
        readonly count: 3;
        readonly defaultValue: [number, number, number];
    };
    ivec4(defaultValue: [number, number, number, number], options?: IntOptions): {
        min: any;
        max: any;
        sensitivity: number;
        scaling: "linear" | "log";
        readonly type: "number";
        readonly step: 1;
        readonly count: 4;
        readonly defaultValue: [number, number, number, number];
    };
    uint(defaultValue: number, options?: IntOptions): {
        min: number;
        max: any;
        sensitivity: number;
        scaling: "linear" | "log";
        readonly type: "number";
        readonly step: 1;
        readonly count: 1;
        readonly defaultValue: number;
    };
    uvec2(defaultValue: [number, number], options?: IntOptions): {
        min: number;
        max: any;
        sensitivity: number;
        scaling: "linear" | "log";
        readonly type: "number";
        readonly step: 1;
        readonly count: 2;
        readonly defaultValue: [number, number];
    };
    uvec3(defaultValue: [number, number, number], options?: IntOptions): {
        min: number;
        max: any;
        sensitivity: number;
        scaling: "linear" | "log";
        readonly type: "number";
        readonly step: 1;
        readonly count: 3;
        readonly defaultValue: [number, number, number];
    };
    uvec4(defaultValue: [number, number, number, number], options?: IntOptions): {
        min: number;
        max: any;
        sensitivity: number;
        scaling: "linear" | "log";
        readonly type: "number";
        readonly step: 1;
        readonly count: 4;
        readonly defaultValue: [number, number, number, number];
    };
};
export type UI = typeof ui;
`])}],["GLMessageClient.d.ts",{type:"file",contents:new Blob([`import { BufferInputRef, GLMessage, GLMessageResponse, GLPrimitive, MenuRef, ProgramRef, ShaderRef, TextureRef, UniformTypeValue } from "../../gl-message/protocol/GLMessageProtocol";
import { UIOption, UIReturnType } from "../../components/gl-message-ui/GLMessageUI";
export type RangeObject = {
    map(min: number, max: number, includeStart?: boolean, includeEnd?: boolean): number;
    divideInterval(min: number, max: number): [number, number];
    index: number;
    step: number;
};
export declare function range<T extends any | Promise<any>>(divisions: number, cb: (range: RangeObject) => T): T extends Promise<any> ? Promise<Awaited<T>[]> : T;
export declare function createGLMessageClient(send: <Msg extends GLMessage>(msg: Msg) => Promise<GLMessageResponse<Msg>>): {
    clear(color?: [number, number, number, number], depth?: number, stencil?: number): Promise<GLMessageResponse<{
        contents: {
            type: "clear";
            color: [number, number, number, number];
            depth: number;
            stencil: number;
        };
        id: string;
    }>>;
    createBufferFromArray<P extends {
        array: number[];
        count: 1 | 2 | 3 | 4;
        encoding: "float" | "int" | "uint" | "normalized-int" | "normalized-uint";
        size: 8 | 16 | 32;
    }>(params: P): Promise<{
        spec: {
            count: 2 | 1 | 3 | 4;
            encoding: "float" | "int" | "uint" | "normalized-int" | "normalized-uint";
            size: 8 | 16 | 32;
            value: number[];
            name: string;
            stride: number;
            offset: number;
        }[];
        id: string;
    }>;
    linkProgram<VertexOutsFragIns extends Record<string, GLPrimitive>>(vertex: ShaderRef<"vertex"> & {
        outputs: VertexOutsFragIns;
    }, fragment: ShaderRef<"fragment"> & {
        inputs: VertexOutsFragIns;
    }): Promise<{
        inputs: Record<string, GLPrimitive>;
        outputs: Record<string, GLPrimitive>;
        uniforms: Record<string, import("../../gl-message/protocol/GLMessageProtocol").UniformType>;
        id: string;
    }>;
    sendGLMessage<Msg extends GLMessage>(msg: Msg): Promise<GLMessageResponse<Msg>>;
    draw<Prog extends ProgramRef>(program: Prog, count: number, inputs: { [Key in keyof Prog["inputs"]]: BufferInputRef; }, outputs: { [Key in keyof Prog["outputs"]]: TextureRef | null; }, uniforms: { [Key in keyof Prog["uniforms"]]: UniformTypeValue<Prog["uniforms"][Key]>; }): Promise<GLMessageResponse<{
        id: string;
        contents: {
            type: "draw";
            program: Prog;
            inputs: { [Key in keyof Prog["inputs"]]: BufferInputRef; };
            outputs: { [Key_1 in keyof Prog["outputs"]]: TextureRef; };
            uniforms: { [Key_2 in keyof Prog["uniforms"]]: UniformTypeValue<Prog["uniforms"][Key_2]>; };
            count: number;
        };
    }>>;
    create8BitRGBATexture(pixels: ArrayBuffer | undefined, width: number, height: number): Promise<TextureRef>;
    loadShader(path: string, type: "vertex" | "fragment"): Promise<{
        inputs: Record<string, GLPrimitive>;
        outputs: Record<string, GLPrimitive>;
        uniforms: Record<string, import("../../gl-message/protocol/GLMessageProtocol").UniformType>;
        shaderType: "vertex" | "fragment";
        id: string;
    }>;
    createMenu<UI extends UIOption>(menu: UI): Promise<{
        id: string;
        menu: UI;
    }>;
    pollMenu<UI extends UIOption>(menu: MenuRef & {
        menu: UI;
    }): Promise<UIReturnType<UI>>;
    getWindowSize(): Promise<{
        width: number;
        height: number;
    }>;
    resize(width: number, height: number): Promise<void>;
    getPanAndZoomBounds(): Promise<{
        center: [number, number];
        dimensions: [number, number];
        bottomLeft: [number, number];
        topRight: [number, number];
    }>;
    resetVideoEncoder(): Promise<void>;
    addVideoFrame(): Promise<void>;
    renderVideo(filename: string, audioLink?: string): Promise<void>;
    readFile(filename: string): Promise<{
        file: Blob | undefined;
    }>;
    loadShaderSource(filename: string): Promise<void>;
};
`])}]])}],["definitions",{type:"dir",contents:new Map([["EvalboxDefs.d.ts",{type:"file",contents:new Blob([`import * as userInterface from "../runtime/EvalboxUIWrapper";
import { createGLMessageClient } from "../runtime/GLMessageClient";
import * as glclient from "../runtime/GLMessageClient";
import * as glm from "../../gl-message/protocol/GLMessageProtocol";
declare global {
    type GLMessageClient = ReturnType<typeof createGLMessageClient>;
    function loop(callback: (time: number) => any): () => void;
    const ui: userInterface.UI;
    const range: typeof glclient.range;
    type UniformType = glm.UniformType;
    type UniformsToValues<G extends Record<string, UniformType>> = glm.UniformsToValues<G>;
    type ShaderFunctionSignatures = {
        retTypes: Record<string, ShaderFunctionParameters>;
    };
    type ShaderFunctionParameters = {
        params: Record<string, ShaderFunctionParameters>;
        functions: Record<string, true>;
    };
    type IsValidComposite<T extends ShaderFunctionSignatures, FnName extends keyof T["retTypes"]["vec4"]["params"]["vec4"]["params"]["vec4"]["functions"]> = T["retTypes"]["vec4"]["params"]["vec4"]["params"]["vec4"]["functions"][FnName];
    type GetFunctionsWithSignature<T extends ShaderFunctionSignatures, RetType extends string, ParamTypes extends string[]> = GetFunctionsWithSignatureParamsOnly<T["retTypes"][RetType], ParamTypes>;
    type GetFunctionsWithSignatureParamsOnly<T extends ShaderFunctionParameters, ParamTypes extends string[]> = ParamTypes extends [
        infer First extends string,
        ...infer Rest extends string[]
    ] ? GetFunctionsWithSignatureParamsOnly<T["params"][First], Rest> : keyof T["functions"];
    type ExcludeSigs<A extends ShaderFunctionSignatures, B extends ShaderFunctionSignatures> = {
        retTypes: {
            [K in keyof A["retTypes"]]: ExcludeSigsParamsOnly<A["retTypes"][K], B["retTypes"][K]>;
        };
    };
    type NoNeverProps<T> = {
        [K in keyof T as T[K] extends never ? never : K]: T[K];
    };
    type ExcludeSigsParamsOnly<A extends ShaderFunctionParameters, B extends ShaderFunctionParameters> = {
        params: {
            [K in keyof A["params"]]: B["params"][K] extends ShaderFunctionParameters ? ExcludeSigsParamsOnly<A["params"][K], B["params"][K]> : A["params"][K];
        };
        functions: {
            [K in Exclude<keyof A["functions"], keyof B["functions"]>]: true;
        };
    };
    type KillEmptySigs<A extends ShaderFunctionSignatures> = {
        retTypes: NoNeverProps<{
            [K in keyof A["retTypes"]]: KillEmptySigsParamsOnly<KillEmptySigsParamsOnlyInner<A["retTypes"][K]>>;
        }>;
    };
    type KillEmptySigsParamsOnly<A extends ShaderFunctionParameters> = {} extends NoNeverProps<A["functions"]> ? {} extends NoNeverProps<A["params"]> ? never : A : A;
    type KillEmptySigsParamsOnlyInner<A extends ShaderFunctionParameters> = {
        functions: A["functions"];
        params: NoNeverProps<{
            [K in keyof A["params"]]: KillEmptySigsParamsOnly<KillEmptySigsParamsOnlyInner<A["params"][K]>>;
        }>;
    };
    type ContainsNoSignatures<A extends ShaderFunctionSignatures> = {
        retTypes: {};
    } extends A ? true : false;
}
`])}]])}]])}],["gl-message",{type:"dir",contents:new Map([["protocol",{type:"dir",contents:new Map([["GLMessageProtocol.d.ts",{type:"file",contents:new Blob([`import { UIOption, UIReturnType } from "../../components/gl-message-ui/GLMessageUI";
export type GLPrimitive = {
    count: 1 | 2 | 3 | 4;
    type: "float" | "int" | "uint";
};
export type UniformType = GLPrimitive | {
    type: "sampler";
    dimensionality: "2D" | "3D" | "2DArray" | "Cube";
    samplerType: "float" | "int" | "uint";
} | {
    type: "sampler";
    samplerType: "shadow";
    dimensionality: "2D" | "2DArray" | "Cube";
};
export type GLPrimitiveToNumber<G extends GLPrimitive> = G["count"] extends 1 ? number : G["count"] extends 2 ? [number, number] : G["count"] extends 3 ? [number, number, number] : [number, number, number, number];
export type UniformTypeValue<G extends UniformType> = G extends GLPrimitive ? GLPrimitiveToNumber<G> : TextureRef;
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
export type GLMessageContents = {
    type: "clear";
    color?: [number, number, number, number];
    depth?: number;
    stencil?: number;
} | {
    type: "create-buffer";
    id: string;
    source: {
        type: "array";
        spec: InterleavedBufferSpec;
    };
} | {
    type: "create-shader";
    source: ShaderSource;
    id: string;
} | {
    type: "create-program";
    vertex: ShaderRef<"vertex">;
    fragment: ShaderRef<"fragment">;
    id: string;
} | {
    type: "draw";
    program: ProgramRef;
    inputs: Record<string, BufferInputRef>;
    outputs: Record<string, TextureRef | null>;
    uniforms: Record<string, number | number[] | TextureRef>;
    count: number;
} | {
    type: "load-file";
    path: string;
} | {
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
} | {
    type: "create-menu";
    id: string;
    menu: UIOption;
} | {
    type: "poll-menu";
    id: string;
    menu: MenuRef;
} | {
    type: "resize";
    width: number;
    height: number;
} | {
    type: "get-window-size";
} | {
    type: "get-pan-and-zoom-bounds";
} | {
    type: "reset-encoder";
} | {
    type: "add-frame";
} | {
    type: "render-video";
    filename: string;
    audioLink?: string;
} | {
    type: "read-file";
    filename: string;
} | {
    type: "get-shader-function-signatures";
    filename: string;
};
export type GLMessageContentsType<T extends GLMessageContents["type"]> = GLMessageContents & {
    type: T;
};
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
export type GLMessageResponseContents<Msg extends GLMessage> = Msg extends GLMessageType<"create-buffer"> ? {
    spec: Msg["contents"]["source"]["spec"];
    id: string;
} : Msg extends GLMessageType<"create-shader"> ? {
    inputs: Msg["contents"]["source"]["inputs"];
    outputs: Msg["contents"]["source"]["outputs"];
    uniforms: Msg["contents"]["source"]["uniforms"];
    shaderType: Msg["contents"]["source"]["shaderType"];
    id: Msg["contents"]["id"];
} : Msg extends GLMessageType<"create-program"> ? {
    inputs: Msg["contents"]["vertex"]["inputs"];
    outputs: Msg["contents"]["fragment"]["outputs"];
    uniforms: Msg["contents"]["vertex"]["uniforms"] & Msg["contents"]["fragment"]["uniforms"];
    id: Msg["contents"]["id"];
} : Msg extends GLMessageType<"load-file"> ? {
    file: Blob | undefined;
} : Msg extends GLMessageType<"create-texture"> ? TextureRef : Msg extends GLMessageType<"create-menu"> ? MenuRef : Msg extends GLMessageType<"poll-menu"> ? UIReturnType<Msg["contents"]["menu"]["menu"]> : Msg extends GLMessageType<"get-window-size"> ? {
    width: number;
    height: number;
} : Msg extends GLMessageType<"get-pan-and-zoom-bounds"> ? {
    bottomLeft: [number, number];
    topRight: [number, number];
} : Msg extends GLMessageType<"read-file"> ? {
    file: Blob | undefined;
} : undefined;
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
`])}]])}],["server",{type:"dir",contents:new Map([["GLMessageServer.d.ts",{type:"file",contents:new Blob([`import { Output, CanvasSource } from "mediabunny";
import { UIOption } from "../../components/gl-message-ui/GLMessageUI";
import { FilesystemAdaptor } from "../../filesystem/fs-protocol/FilesystemAdaptor";
import { GLMessage, GLMessageResponse, GLPrimitive } from "../protocol/GLMessageProtocol";
export declare function typeNameToGLPrimitive(typename: string): GLPrimitive | undefined;
export type GLMessageContext = {
    gl: WebGL2RenderingContext;
    buffers: Map<string, WebGLBuffer>;
    shaders: Map<string, WebGLShader>;
    programs: Map<string, WebGLProgram>;
    textures: Map<string, WebGLTexture>;
    menus: Map<string, {
        spec: UIOption;
        value: any;
    }>;
    fs: FilesystemAdaptor;
    canvas: HTMLCanvasElement;
    container: {
        current: HTMLElement | null;
    };
    zoomPan: {
        current: {
            bottomLeft: [number, number];
            topRight: [number, number];
        };
    };
    videoRef: {
        current: {
            output: Output;
            canvasSource: CanvasSource;
            frameIndex: number;
            framerate: number;
        };
    };
};
export declare function executeGLMessage<Msg extends GLMessage>(msgwrapper: Msg, context: GLMessageContext): Promise<GLMessageResponse<Msg>>;
`])}]])}]])}],["languages",{type:"dir",contents:new Map([["glsl",{type:"dir",contents:new Map([["parser",{type:"dir",contents:new Map([["glsl-keywords.d.ts",{type:"file",contents:new Blob([`export declare const GLSL_KEYWORDS: string[];
export declare const GLSL_SYMBOLS: string[];
`])}],["lexer.d.ts",{type:"file",contents:new Blob([`export declare enum TokenKind {
    Symbol = 0,
    Keyword = 1,
    Whitespace = 2,
    Comment = 3,
    Identifier = 4,
    IntegerDecimal = 5,
    IntegerOctal = 6,
    IntegerHex = 7,
    Float = 8,
    ImportString = 9
}
export declare const lexer: import("typescript-parsec").Lexer<TokenKind>;
`])}],["interleave-comments.d.ts",{type:"file",contents:new Blob([`import { lrec_sc, Parser } from "typescript-parsec";
import { TokenKind } from "./lexer";
import { ASTNode, BinaryOpExpr, Comment, Commented } from "./parser";
export declare function seq_interleave<I, TKind, T1, T2>(i: Parser<TKind, I>, p1: Parser<TKind, T1>, p2: Parser<TKind, T2>): Parser<TKind, [T1, I, T2]>;
export declare function seq_interleave<I, TKind, T1, T2, T3>(i: Parser<TKind, I>, p1: Parser<TKind, T1>, p2: Parser<TKind, T2>, p3: Parser<TKind, T3>): Parser<TKind, [T1, I, T2, I, T3]>;
export declare function seq_interleave<I, TKind, T1, T2, T3, T4>(i: Parser<TKind, I>, p1: Parser<TKind, T1>, p2: Parser<TKind, T2>, p3: Parser<TKind, T3>, p4: Parser<TKind, T4>): Parser<TKind, [T1, I, T2, I, T3, I, T4]>;
export declare const rep_interleave_sc: typeof lrec_sc;
export declare const comment_parser: Parser<TokenKind, Comment[]>;
export declare function comment_before<T1>(p: Parser<TokenKind, T1>): Parser<TokenKind, [Comment[], T1]>;
export declare function with_comment_before<T>(p: Parser<TokenKind, T>): Parser<TokenKind, Commented<T>>;
export declare function nodeify<T>(p: Parser<TokenKind, T>): Parser<TokenKind, ASTNode<T>>;
export declare function nodeify_commented<T>(p: Parser<TokenKind, Commented<T>>): Parser<TokenKind, ASTNode<T>>;
export declare function commentify<T, U>(p: Parser<TokenKind, T>, convertToData: (t: T) => U, convertToComments: (t: T) => Comment[][]): Parser<TokenKind, Commented<U>>;
export declare function commentify_no_comments_before<T, U>(p: Parser<TokenKind, T>, convertToData: (t: T) => U, convertToComments: (t: T) => Comment[][]): Parser<TokenKind, Commented<U>>;
export declare function append_comments<T, U>(p: Parser<TokenKind, T>, convertToData: (t: T) => Commented<U>, convertToComments: (t: T) => Comment[][]): Parser<TokenKind, Commented<U>>;
export declare function add_comments_and_transform<T, U, V>(p: Parser<TokenKind, T>, convertToOldCommented: (t: T) => Commented<U>, convertToData: (u: U, t: T) => V, mergeComments: (oldComments: Comment[][], t: T) => Comment[][]): Parser<TokenKind, Commented<V>>;
export declare function stretch_node<T, U>(p: Parser<TokenKind, T>, node: (t: T) => ASTNode<U>, commentsBefore: (t: T) => Comment[][], commentsAfter: (t: T) => Comment[][]): Parser<TokenKind, ASTNode<U>>;
export declare function custom_node<T, U>(p: Parser<TokenKind, T>, node: (t: T) => U, comments: (t: T) => Comment[][]): Parser<TokenKind, ASTNode<U>>;
export declare function add_comments<T, U>(p: Parser<TokenKind, T>, node: (t: T) => ASTNode<U>, comments: (t: T, oldComments: Comment[][]) => Comment[][]): Parser<TokenKind, ASTNode<U>>;
export declare function binop_generic<T, U>(left: Parser<TokenKind, ASTNode<T>>, right: Parser<TokenKind, U>, combine: (l: ASTNode<T>, r: U, start: number, end: number) => [T, Comment[][]]): Parser<TokenKind, ASTNode<T>>;
export declare function binop<NodeType extends ASTNode<T>, T>(higher_prec: Parser<TokenKind, NodeType>, self_prec: Parser<TokenKind, ASTNode<T>>, ops: Parser<TokenKind, BinaryOpExpr["op"]>): Parser<TokenKind, ASTNode<BinaryOpExpr> | NodeType>;
`])}],["useful-combinators.d.ts",{type:"file",contents:new Blob([`import { Parser } from "typescript-parsec";
import { TokenKind } from "./lexer";
import { ASTNode, Expr, Stmt } from "./parser";
export declare function lstr<T extends string>(s: T): Parser<TokenKind, T>;
export declare function errExprFallback(parser: Parser<TokenKind, ASTNode<Expr>>, err: string, parseAfter?: Parser<TokenKind, any>, errParser?: Parser<TokenKind, Expr>): Parser<TokenKind, ASTNode<Expr>>;
export declare function errStmtFallback(parser: Parser<TokenKind, ASTNode<Stmt>>, err: string, parseAfter?: Parser<TokenKind, any>, errParser?: Parser<TokenKind, Stmt>): Parser<TokenKind, ASTNode<Stmt>>;
export declare function failOnErrExpr(parser: Parser<TokenKind, ASTNode<Expr>>): Parser<TokenKind, ASTNode<Expr>>;
export declare function fail_if<T>(parser: Parser<TokenKind, T>, fail: Parser<TokenKind, any>): Parser<TokenKind, T>;
export declare function consumeUntil(parser: Parser<TokenKind, any>, after?: Parser<TokenKind, any>): Parser<TokenKind, undefined>;
`])}],["parser.d.ts",{type:"file",contents:new Blob([`import { TokenKind } from "./lexer";
type ErrorExpr = {
    type: "error";
    errorType: "expr";
    _isExpr: true;
    _isError: true;
    why: string;
};
type IntExpr = {
    type: "int";
    int: number;
    asString: string;
    unsigned: boolean;
    _isExpr: true;
};
type FloatExpr = {
    type: "float";
    float: number;
    asString: string;
    _isExpr: true;
};
type BoolExpr = {
    type: "bool";
    bool: boolean;
    _isExpr: true;
};
export type VariableExpr = {
    type: "ident";
    ident: string;
    _isExpr: true;
};
type ConditionalExpr = {
    type: "conditional";
    condition: ASTNode<Expr>;
    ifTrue: ASTNode<Expr>;
    ifFalse: ASTNode<Expr>;
    _isExpr: true;
};
export type Comment = {
    comment: string;
};
export type BinaryOpExpr = {
    type: "binary-op";
    left: ASTNode<Expr>;
    right: ASTNode<Expr>;
    op: "+" | "-" | "*" | "/" | "%" | "==" | "!=" | ">" | "<" | ">=" | "<=" | "&&" | "||" | "^^" | "[]" | "&" | "^" | "|" | ">>" | "<<" | ",";
    _isExpr: true;
};
export type AssignmentExpr = {
    type: "assignment";
    left: ASTNode<Expr>;
    right: ASTNode<Expr>;
    op: AssignmentOperator;
    _isExpr: true;
};
export type UnaryOpExpr = {
    type: "unary-op";
    left: ASTNode<Expr>;
    op: "++" | "--" | "!" | "~" | "+" | "-";
    isAfter: boolean;
    _isExpr: true;
};
export type FieldAccessExpr = {
    type: "field-access";
    left: ASTNode<Expr>;
    right: {
        type: "variable";
        variable: Commented<string>;
    } | {
        type: "function";
        function: ASTNode<FunctionCallExpr>;
    };
    _isExpr: true;
};
export type FunctionCallExpr = {
    type: "function-call";
    identifier: FunctionIdentifier;
    args: ASTNode<Expr>[];
    isVoid: boolean;
    _isExpr: true;
};
export type Expr = ErrorExpr | IntExpr | FloatExpr | BoolExpr | VariableExpr | BinaryOpExpr | UnaryOpExpr | FieldAccessExpr | FunctionCallExpr | ConditionalExpr | AssignmentExpr;
export type ErrorStmt = {
    type: "error";
    errorType: "stmt";
    why: string;
    _isStmt: true;
    _isError: true;
};
export type ExprStmt = {
    type: "expr";
    expr?: ASTNode<Expr>;
    _isStmt: true;
};
export type SwitchStmt = {
    type: "switch";
    expr: ASTNode<Expr>;
    stmts: ASTNode<Stmt>[];
    _isStmt: true;
};
export type CaseLabelStmt = {
    type: "case";
    expr: ASTNode<Expr>;
    _isStmt: true;
};
export type DefaultCaseLabelStmt = {
    type: "default-case";
    _isStmt: true;
};
export type JumpStmt = {
    type: "continue" | "break" | "discard";
    _isStmt: true;
};
export type ReturnStmt = {
    type: "return";
    expr?: ASTNode<Expr>;
    _isStmt: true;
};
export type DeclarationStmt = {
    type: "declaration";
    decl: Commented<Declaration>;
    _isStmt: true;
};
export type CompoundStmt = {
    statements: ASTNode<Stmt>[];
    type: "compound";
    _isStmt: true;
};
export type SelectionStmt = {
    cond: ASTNode<Expr>;
    rest: Commented<SelectionRestStmt>;
    type: "selection";
    _isStmt: true;
};
export type SelectionRestStmt = {
    if: ASTNode<Stmt>;
    else?: ASTNode<Stmt>;
    _isStmt: true;
};
export type IterationStmt = {
    type: "while";
    cond: Commented<Condition>;
    body: ASTNode<Stmt>;
    _isStmt: true;
} | {
    type: "do-while";
    cond: ASTNode<Expr>;
    body: ASTNode<Stmt>;
    _isStmt: true;
} | {
    type: "for";
    init: ASTNode<Stmt>;
    rest: Commented<ForRestStatement>;
    body: ASTNode<Stmt>;
    _isStmt: true;
};
export type Stmt = ExprStmt | SwitchStmt | CaseLabelStmt | DefaultCaseLabelStmt | JumpStmt | ReturnStmt | DeclarationStmt | CompoundStmt | SelectionStmt | IterationStmt | ErrorStmt;
export type ExternalDeclarationFunction = {
    type: "function";
    prototype: Commented<FunctionHeader>;
    body: ASTNode<CompoundStmt>;
    _isExtDecl: true;
};
export type ExternalDeclarationDeclaration = {
    type: "declaration";
    decl: Commented<Declaration>;
    _isExtDecl: true;
};
export type SingleItemImport = {
    name: string;
    alias?: string;
};
export type Imports = {
    type: "all";
    prefix: string;
} | {
    type: "some";
    imports: ASTNode<SingleItemImport>[];
};
export type ExternalDeclarationImport = {
    type: "import";
    from: string;
    imports: Commented<Imports>;
};
export type ExternalDeclaration = ExternalDeclarationFunction | ExternalDeclarationDeclaration | ExternalDeclarationImport;
export type ASTNode<T> = {
    data: T;
    comments: Comment[][];
    range: {
        start: number;
        end: number;
    };
    _isNode: true;
};
export declare function dummyNode<T>(data: T, range?: {
    start: number;
    end: number;
}): ASTNode<T>;
export type Commented<T> = {
    data: T;
    comments: Comment[][];
};
export type Declaration = {
    type: "function-prototype";
    prototype: Commented<FunctionHeader>;
    _isDecl: true;
} | {
    type: "declarator-list";
    declaratorList: Commented<InitDeclaratorList>;
    _isDecl: true;
} | {
    type: "type-specifier";
    precision: Commented<Precision>;
    specifier: Commented<TypeNoPrec>;
    _isDecl: true;
} | {
    type: "struct";
    typeQualifier: Commented<TypeQualifier>;
    name: Commented<string>;
    name2?: Commented<string>;
    declarationList: Commented<StructDeclarationList>;
    constantExpr?: ASTNode<Expr>;
    _isDecl: true;
} | {
    type: "type-qualifier";
    typeQualifier: Commented<TypeQualifier>;
    _isDecl: true;
};
export type FunctionIdentifier = {
    type: "function-identifier";
    identifier: string;
} | TypeSpecifier;
export type TypeSpecifier = {
    type: "type-specifier";
    precision?: Commented<Precision>;
    specifier: Commented<TypeNoPrec>;
};
export type TypeNoPrec = {
    typeName: Commented<TypeSpecifierNonarray>;
    arrayType: {
        type: "static";
        size: ASTNode<Expr>;
    } | {
        type: "dynamic";
    } | {
        type: "none";
    };
};
export type TypeSpecifierNonarray = {
    type: "builtin";
    name: Commented<string>;
} | {
    type: "struct";
    struct: Commented<StructSpecifier>;
} | {
    type: "custom";
    name: Commented<string>;
};
export type TypeQualifier = {
    type: "sq";
    storageQualifier: Commented<StorageQualifier>;
} | {
    type: "lq-sq";
    layoutQualifier: Commented<LayoutQualifier>;
    storageQualifier?: Commented<StorageQualifier>;
} | {
    type: "intq-sq";
    interpolationQualifier: Commented<InterpolationQualifier>;
    storageQualifier?: Commented<StorageQualifier>;
} | {
    type: "invq-intq-sq";
    invariantQualifier: Commented<InvariantQualifier>;
    interpolationQualifier?: Commented<InterpolationQualifier>;
    storageQualifier: Commented<StorageQualifier>;
};
export type LayoutQualifier = Commented<LayoutQualifierId>[];
export type InvariantQualifier = "invariant";
export type InterpolationQualifier = "smooth" | "flat";
export type StorageQualifier = "const" | "in" | "out" | "centroid in" | "centroid out" | "uniform";
export type Precision = "lowp" | "mediump" | "highp";
export type AssignmentOperator = "=" | "*=" | "/=" | "%=" | "+=" | "-=" | "<<=" | ">>=" | "&=" | "^=" | "|=";
export type LayoutQualifierId = {
    identifier: string;
    value?: number;
};
export type InitDeclaratorList = {
    init: Commented<SingleDeclarationStart>;
    declarations: Commented<Commented<SingleDeclaration>[]>;
};
export type SingleDeclarationVariant = {
    type: "sized-array";
    size: ASTNode<Expr>;
} | {
    type: "initialized-array";
    size?: ASTNode<Expr>;
    initializer: ASTNode<Expr>;
} | {
    type: "initialized";
    initializer: ASTNode<Expr>;
};
export type SingleDeclaration = {
    name: Commented<string>;
    variant?: Commented<SingleDeclarationVariant>;
};
export type SingleDeclarationStart = {
    type: "type";
    declType: Commented<FullySpecifiedType>;
} | {
    type: "invariant";
};
export type FullySpecifiedType = {
    specifier: ASTNode<TypeSpecifier>;
    qualifier?: Commented<TypeQualifier>;
};
export type ParameterTypeQualifier = "const";
export type ParameterQualifier = "in" | "out" | "inout";
export type ParameterTypeSpecifier = TypeSpecifier;
export type ParameterDeclarator = {
    typeSpecifier: ASTNode<TypeSpecifier>;
    identifier: Commented<string>;
    arraySize?: ASTNode<Expr>;
};
export type FunctionHeader = {
    fullySpecifiedType: Commented<FullySpecifiedType>;
    name: Commented<string>;
    parameters?: Commented<ASTNode<ParameterDeclaration>[]>;
};
export type ParameterDeclaration = {
    parameterTypeQualifier?: Commented<ParameterTypeQualifier>;
    parameterQualifier?: Commented<ParameterQualifier>;
    declaratorOrSpecifier: {
        type: "declarator";
        declarator: Commented<ParameterDeclarator>;
    } | {
        type: "specifier";
        specifier: ASTNode<ParameterTypeSpecifier>;
    };
};
export type StructSpecifier = {
    members: Commented<StructDeclarationList>;
    name?: Commented<string>;
    _isStruct: true;
};
export type StructDeclarationList = Commented<StructDeclaration>[];
export type StructDeclaration = {
    typeQualifier?: Commented<TypeQualifier>;
    typeSpecifier: Commented<TypeSpecifier>;
    declaratorList: Commented<StructDeclaratorList>;
};
export type StructDeclaratorList = Commented<StructDeclarator>[];
export type StructDeclarator = {
    name: string;
    isArray?: {
        expr?: ASTNode<Expr>;
    };
};
export type ForRestStatement = {
    condition?: Commented<Condition>;
    expr?: ASTNode<Expr>;
};
export type Condition = {
    type: "expr";
    expr: ASTNode<Expr>;
} | {
    type: "type-equal-init";
    fullySpecifiedType: Commented<FullySpecifiedType>;
    name: Commented<string>;
    initializer: ASTNode<Expr>;
};
export type TranslationUnit = ASTNode<ASTNode<ExternalDeclaration>[]>;
export declare const primary_expression: import("typescript-parsec").Rule<TokenKind, ASTNode<Expr>>;
export declare const postfix_expression: import("typescript-parsec").Rule<TokenKind, ASTNode<Expr>>;
export declare const integer_expression: import("typescript-parsec").Rule<TokenKind, ASTNode<Expr>>;
export declare const function_call: import("typescript-parsec").Rule<TokenKind, ASTNode<Expr>>;
export declare const function_call_generic: import("typescript-parsec").Rule<TokenKind, ASTNode<FunctionCallExpr>>;
export declare const function_call_header_no_parameters: import("typescript-parsec").Rule<TokenKind, Commented<FunctionCallExpr>>;
export declare const function_call_header_with_parameters: import("typescript-parsec").Rule<TokenKind, Commented<FunctionCallExpr>>;
export declare const function_call_header: import("typescript-parsec").Rule<TokenKind, Commented<FunctionIdentifier>>;
export declare const unary_expression: import("typescript-parsec").Rule<TokenKind, ASTNode<Expr>>;
export declare const multiplicative_expression: import("typescript-parsec").Rule<TokenKind, ASTNode<Expr>>;
export declare const and_expression: import("typescript-parsec").Rule<TokenKind, ASTNode<Expr>>;
export declare const logical_or_expression: import("typescript-parsec").Rule<TokenKind, ASTNode<Expr>>;
export declare const assignment_expression: import("typescript-parsec").Rule<TokenKind, ASTNode<Expr>>;
export declare const expression: import("typescript-parsec").Rule<TokenKind, ASTNode<Expr>>;
export declare const declaration: import("typescript-parsec").Rule<TokenKind, ASTNode<Declaration>>;
export declare const function_prototype: import("typescript-parsec").Rule<TokenKind, Commented<FunctionHeader>>;
export declare const parameter_declarator: import("typescript-parsec").Rule<TokenKind, Commented<ParameterDeclarator>>;
export declare const init_declarator_list: import("typescript-parsec").Rule<TokenKind, Commented<InitDeclaratorList>>;
export declare const fully_specified_type: import("typescript-parsec").Rule<TokenKind, Commented<FullySpecifiedType>>;
export declare const layout_qualifier: import("typescript-parsec").Rule<TokenKind, Commented<LayoutQualifier>>;
export declare const layout_qualifier_id: import("typescript-parsec").Rule<TokenKind, Commented<LayoutQualifierId>>;
export declare const statement: import("typescript-parsec").Rule<TokenKind, ASTNode<Stmt>>;
export declare const translation_unit: import("typescript-parsec").Rule<TokenKind, TranslationUnit>;
export declare const external_declaration: import("typescript-parsec").Rule<TokenKind, ASTNode<ExternalDeclaration>>;
export {};
`])}],["parser-combined.d.ts",{type:"file",contents:new Blob([`import { Parser, Token } from "typescript-parsec";
import { TokenKind } from "./lexer";
import { TranslationUnit } from "./parser";
import { Result } from "../../../utilities/result/result";
export type ParserResult = {
    translationUnit: TranslationUnit;
};
export type ParserError = {
    why: string;
};
export declare function lexGLSL(source: string): Result<Token<TokenKind> | undefined, ParserError>;
export declare function tryParseGLSLRaw<T>(tokens: Token<TokenKind> | undefined, parser: Parser<TokenKind, T>): T;
export declare function parseWith<T>(str: string, parser: Parser<TokenKind, T>): T;
export declare function parseGLSLFragmentWithoutPreprocessing<T>(source: string, parser: Parser<TokenKind, T>): Result<T, ParserError>;
export declare function parseGLSLWithoutPreprocessing(source: string): Result<ParserResult, ParserError>;
`])}],["glsl-ast-utils.d.ts",{type:"file",contents:new Blob([`import { ASTNode, Commented, Declaration, Expr, ExternalDeclaration, ExternalDeclarationFunction, ParameterDeclaration, Stmt, StructSpecifier, TranslationUnit } from "./parser";
export declare function getFunctions(tu: TranslationUnit): Commented<ExternalDeclarationFunction>[];
export declare function getParameters(fn: Commented<ExternalDeclarationFunction>): Commented<Commented<ParameterDeclaration>[]>;
export declare function getNamedInputParameters(fn: Commented<ExternalDeclarationFunction>): {
    name: string;
    param: Commented<ParameterDeclaration>;
}[];
export declare function getNamedOutputParameters(fn: Commented<ExternalDeclarationFunction>): {
    name: string;
    param: Commented<ParameterDeclaration>;
}[];
export declare function mapOverJson(json: any, map: (json: any) => any): any;
export declare function mapAST<T>(t: T, map: {
    expr?(expr: ASTNode<Expr>, mapInner: (expr: ASTNode<Expr>) => ASTNode<Expr>): ASTNode<Expr>;
    stmt?(stmt: ASTNode<Stmt>, mapInner: (stmt: ASTNode<Stmt>) => ASTNode<Stmt>): ASTNode<Stmt>;
    decl?(decl: ASTNode<Declaration>, mapInner: (decl: ASTNode<Declaration>) => ASTNode<Declaration>): Commented<Declaration>;
    extDecl?(extDecl: ASTNode<ExternalDeclaration>, mapInner: (extDecl: ASTNode<ExternalDeclaration>) => ASTNode<ExternalDeclaration>): ASTNode<ExternalDeclaration>;
    struct?(struct: StructSpecifier, mapInner: (struct: StructSpecifier) => StructSpecifier): StructSpecifier;
    error?(err: ASTNode<{
        _isError: true;
        why: string;
    }>, mapInner: (err: ASTNode<{
        _isError: true;
        why: string;
    }>) => ASTNode<{
        _isError: true;
        why: string;
    }>): ASTNode<{
        _isError: true;
        why: string;
    }>;
}): T;
export declare function renameSymbols<T>(t: T, rename: (s: string) => string): T;
export declare function mapGlobalSymbols(t: TranslationUnit, rename: (str: string) => string): TranslationUnit;
export declare function mapAllSymbolsDefinedByStmt(s: ASTNode<Stmt>, rename: (str: string) => string): ASTNode<Stmt>;
export declare function mapAllSymbolsDefinedInsideStmt(s: ASTNode<Stmt>, rename: (str: string) => string): ASTNode<Stmt>;
export declare function getAllStatementsInsideStmt(s: ASTNode<Stmt>): ASTNode<Stmt>[];
export declare function mapAllSymbolsDefinedInsideExtDecl(ed: ASTNode<ExternalDeclaration>, rename: (s: string) => string): ASTNode<ExternalDeclaration>;
export declare function mapAllSymbolsDefinedByExtDecl(ed: ASTNode<ExternalDeclaration>, rename: (s: string) => string): ASTNode<ExternalDeclaration>;
export declare function mapAllStatementsInsideExtDecl(ed: ASTNode<ExternalDeclaration>, map: (s: ASTNode<Stmt>) => ASTNode<Stmt>): ASTNode<ExternalDeclaration>;
`])}]])}],["fmt",{type:"dir",contents:new Map([["fmt-shared.d.ts",{type:"file",contents:new Blob([`export declare const unaryPrecedences: {
    defined: number;
    "++": number;
    "--": number;
    "+": number;
    "-": number;
    "~": number;
    "!": number;
};
export declare const binaryPrecedences: {
    defined: number;
    "[]": number;
    "*": number;
    "/": number;
    "%": number;
    "+": number;
    "-": number;
    "<<": number;
    ">>": number;
    "<": number;
    ">": number;
    "<=": number;
    ">=": number;
    "==": number;
    "!=": number;
    "&": number;
    "^": number;
    "|": number;
    "&&": number;
    "^^": number;
    "||": number;
    ",": number;
};
export declare const minPrecedence = 10;
export declare const maxPrecedence = 150;
`])}],["fmt-fancy.d.ts",{type:"file",contents:new Blob([`import { ASTNode, Commented, Condition, Declaration, Expr, ExternalDeclaration, ForRestStatement, FullySpecifiedType, FunctionHeader, FunctionIdentifier, InitDeclaratorList, InterpolationQualifier, InvariantQualifier, LayoutQualifier, LayoutQualifierId, ParameterDeclaration, ParameterDeclarator, ParameterQualifier, ParameterTypeQualifier, Precision, SelectionRestStmt, SingleDeclaration, SingleDeclarationStart, Stmt, StorageQualifier, StructDeclaration, StructDeclarationList, StructDeclarator, StructDeclaratorList, StructSpecifier, TranslationUnit, TypeNoPrec, TypeQualifier, TypeSpecifier, TypeSpecifierNonarray } from "../parser/parser";
export type ExprCtx = {
    precedence: number;
};
export type NodeCtx = {
    indent: number;
};
export declare const defaultNodeCtx: {
    indent: number;
};
export declare const makeFancyFormatter: (lineLengthLimit?: number, indentAmount?: number) => {
    exprmax(e: ASTNode<Expr>): any;
    expr(e: ASTNode<Expr>, c: ExprCtx): string;
    functionCallIdentifier(i: FunctionIdentifier): string;
    typeSpecifier(ts: Commented<TypeSpecifier>): string;
    typeSpecifierNoCommented(ts: TypeSpecifier): string;
    precision(p: Commented<Precision>): string;
    typeNoPrec(tnp: Commented<TypeNoPrec>): string;
    typeSpecifierNonarray(tsn: Commented<TypeSpecifierNonarray>): string;
    structSpecifier(ss: Commented<StructSpecifier>): string;
    structDeclarationList(sdl: Commented<StructDeclarationList>): string;
    structDeclaration(sd: Commented<StructDeclaration>): string;
    structDeclaratorList(sdl: Commented<StructDeclaratorList>): string;
    structDeclarator(sd: Commented<StructDeclarator>): string;
    parameterDeclaration(pd: Commented<ParameterDeclaration>): string;
    parameterDeclarator(pd: Commented<ParameterDeclarator>): string;
    parameterTypeQualifier(ptq: Commented<ParameterTypeQualifier>): string;
    parameterQualifier(pq: Commented<ParameterQualifier>): string;
    typeQualifier(tq: Commented<TypeQualifier>): string;
    invariantQualifier(iq: Commented<InvariantQualifier>): string;
    layoutQualifier(lq: Commented<LayoutQualifier>): string;
    layoutQualifierId(lqid: Commented<LayoutQualifierId>): string;
    storageQualifier(sq: Commented<StorageQualifier>): string;
    interpolationQualifier(iq: Commented<InterpolationQualifier>): string;
    initDeclaratorList(idl: Commented<InitDeclaratorList>): string;
    singleDeclarationStart(sds: Commented<SingleDeclarationStart>): string;
    singleDeclaration(sd: Commented<SingleDeclaration>): string;
    declaration(d: Commented<Declaration>): string;
    statement(s: ASTNode<Stmt>, ctx?: NodeCtx): string;
    forRestStatement(frs: Commented<ForRestStatement>): string;
    selectionRestStmt(srs: Commented<SelectionRestStmt>): string;
    condition(c: Commented<Condition>): any;
    fullySpecifiedType(fst: Commented<FullySpecifiedType>): string;
    functionPrototype(fp: Commented<FunctionHeader>): string;
    translationUnit(tr: TranslationUnit): string;
    externalDeclaration(ed: ASTNode<ExternalDeclaration>): string;
};
`])}]])}],["typechecker",{type:"dir",contents:new Map([["validate-swizzle.d.ts",{type:"file",contents:new Blob([`export declare function swizzleCharToIndex(char: string): number;
export declare function getSwizzleRegex(arity: 2 | 3 | 4): RegExp;
export declare function permute<T>(arr: T[]): T[][];
export declare function powerSet<T>(arr: T[]): T[][];
export declare function getNonemptyStringPermutations(str: string): string[];
export declare const lValueSwizzles: {
    2: Set<string>;
    3: Set<string>;
    4: Set<string>;
};
`])}],["glsltype.d.ts",{type:"file",contents:new Blob([`import { ASTNode, Expr, FullySpecifiedType } from "../parser/parser";
import { Scope } from "../langsupport/glsl-language-server";
import { TypeError } from "./typecheck";
export type PType = "int" | "uint" | "bool" | "float";
export type Arity = 1 | 2 | 3 | 4;
export type GLSLType = {
    type: "primitive";
    arity: Arity;
    ptype: PType;
} | {
    type: "array";
    elementType: GLSLType;
    size: number;
} | {
    type: "struct";
    name: string;
};
export declare const builtinTypes: {
    int: GLSLType;
    float: GLSLType;
    uint: GLSLType;
    bool: GLSLType;
    vec2: GLSLType;
    ivec2: GLSLType;
    uvec2: GLSLType;
    bvec2: GLSLType;
    vec3: GLSLType;
    ivec3: GLSLType;
    uvec3: GLSLType;
    bvec3: GLSLType;
    vec4: GLSLType;
    ivec4: GLSLType;
    uvec4: GLSLType;
    bvec4: GLSLType;
};
export declare function isSameType(a: GLSLType | undefined, b: GLSLType | undefined): boolean;
export declare function stringifyType(type: GLSLType): string;
export declare function matchesPrimitiveTypes<P extends PType, A extends Arity>(type: GLSLType | undefined, ptypes?: P[], arities?: A[]): type is {
    type: "primitive";
    ptype: P;
    arity: A;
};
export declare function isInt(type: GLSLType | undefined): type is {
    type: "primitive";
    ptype: "int";
    arity: Arity;
};
export declare function isUint(type: GLSLType | undefined): type is {
    type: "primitive";
    ptype: "uint";
    arity: Arity;
};
export declare function isNumericalVector(type: GLSLType | undefined): type is {
    type: "primitive";
    ptype: "float" | "int" | "uint";
    arity: Arity;
};
export declare function isScalar(type: GLSLType | undefined): type is {
    type: "primitive";
    ptype: PType;
    arity: 1;
};
export declare function isIntegralVector(type: GLSLType | undefined): type is {
    type: "primitive";
    ptype: "int" | "uint";
    arity: Arity;
};
export declare function getArity(type: GLSLType | undefined): Arity | undefined;
export declare function getPType(type: GLSLType | undefined): PType | undefined;
export type TypeResult = {
    type?: GLSLType;
    errors: TypeError;
};
export declare function convertType(type: FullySpecifiedType, scopes: Scope[], unsizedArrayInitializer?: {
    type: "expr";
    expr: ASTNode<Expr>;
} | {
    type: "num";
    size: number;
}): TypeResult;
`])}],["typecheck.d.ts",{type:"file",contents:new Blob([`import { ASTNode, Commented, Expr, FullySpecifiedType, ParameterDeclaration, TypeNoPrec } from "../parser/parser";
import { Scope } from "../langsupport/glsl-language-server";
import { TypeResult } from "./glsltype";
export declare function isFloatOrFloatVector(t: FullySpecifiedType | undefined): boolean;
export declare function isSignedIntOrIntVector(t: FullySpecifiedType | undefined): boolean;
export declare function isUnsignedIntOrIntVector(t: FullySpecifiedType | undefined): boolean;
export declare function isBoolOrBoolVector(t: FullySpecifiedType | undefined): boolean;
export declare function isIntOrIntVector(t: FullySpecifiedType | undefined): boolean;
export declare function isNumberOrNumberVector(t: FullySpecifiedType | undefined): boolean;
export declare function isPrimitiveOrPrimitiveVector(t: FullySpecifiedType | undefined): boolean;
export declare function getPrimitiveStringFromTypeAndArity(type: "float" | "int" | "uint" | "bool", arity: 1 | 2 | 3 | 4): string;
export declare function getPrimitiveFromTypeAndArity(type: "float" | "int" | "uint" | "bool", arity: 1 | 2 | 3 | 4): FullySpecifiedType;
export declare function isArrayType(t: FullySpecifiedType | undefined): boolean;
export declare function getTypePrimitiveCategory(t: FullySpecifiedType | undefined): "float" | "int" | "uint" | "bool" | undefined;
export declare function getTypePrimitiveArity(t: FullySpecifiedType | undefined): 1 | 2 | 3 | 4 | undefined;
export declare function builtinType(name: string, array?: TypeNoPrec["arrayType"]): FullySpecifiedType;
export type TypeError = {
    start: number;
    end: number;
    why: string;
}[];
export declare function nodeTypeErr(node: ASTNode<any>, why: string): TypeError;
export declare function getFunctionParamType(param: ParameterDeclaration): FullySpecifiedType;
export declare function getFunctionParamName(param: ParameterDeclaration): string | undefined;
export declare function getFunctionParamTypeNode(param: ASTNode<ParameterDeclaration>): Commented<FullySpecifiedType>;
export declare function unarrayType(type: FullySpecifiedType): FullySpecifiedType;
export declare function arrayifyType(type: FullySpecifiedType, size?: number): FullySpecifiedType;
export declare function getExprType(expr: ASTNode<Expr>, scopeChain: Scope[]): TypeResult;
`])}],["get-inputs-outputs.d.ts",{type:"file",contents:new Blob([`import { GLPrimitive, UniformType } from "../../../gl-message/protocol/GLMessageProtocol";
import { TranslationUnit } from "../parser/parser";
export declare function getInputsOutputsAndUniforms(tu: TranslationUnit): {
    uniforms: Record<string, UniformType>;
    inputs: Record<string, GLPrimitive>;
    outputs: Record<string, GLPrimitive>;
};
`])}]])}],["evaluator",{type:"dir",contents:new Map([["evaluator.d.ts",{type:"file",contents:new Blob([`import { ASTNode, Expr, FullySpecifiedType, Stmt, TranslationUnit } from "../parser/parser";
import { Scope } from "../langsupport/glsl-language-server";
export type GLSLValue = {
    type: "vector";
    vectorType: "int" | "float" | "uint" | "bool";
    size: 1 | 2 | 3 | 4;
    value: number[];
} | {
    type: "array";
    value: GLSLValue[];
} | {
    type: "struct";
    structType: string;
    fields: Map<string, GLSLValue>;
} | {
    type: "error";
} | {
    type: "uninitialized";
    intendedType: FullySpecifiedType;
};
declare function vec(vectorType: "int" | "float" | "uint" | "bool", size: 1 | 2 | 3 | 4, isConst: boolean, value: number[]): GLSLValue;
export declare const constructVectorValue: typeof vec;
export type StackFrame = {
    correspondingScopes: Scope[];
    values: Map<string, {
        value: GLSLValue;
        type: FullySpecifiedType;
    } | undefined>;
    returnValue?: GLSLValue;
    isFunctionRoot?: boolean;
};
export declare function isConst(expr: ASTNode<Expr>, scopeChain: Scope[]): boolean;
export declare function isLValue(expr: ASTNode<Expr>, scopeChain: Scope[]): boolean;
export declare function assignToLValue(lvalue: ASTNode<Expr>, stack: StackFrame[], assign: (oldvalue: GLSLValue, newvalue: GLSLValue) => GLSLValue, newvalue: GLSLValue): GLSLValue;
export declare function evaluateExpression(expr: ASTNode<Expr>, stack: StackFrame[]): GLSLValue;
export declare function evalexpr(expr: ASTNode<Expr>, stack: StackFrame[]): GLSLValue;
type EvaluateStatementResult = {
    returnValue?: GLSLValue;
    shouldReturn?: boolean;
    shouldBreak?: boolean;
    shouldContinue?: boolean;
    caseResult?: GLSLValue;
    execNext?: ASTNode<Stmt>[];
    defaultCase?: boolean;
    discard?: boolean;
};
export declare function evaluateStatement(stmt: ASTNode<Stmt>, stack: StackFrame[]): EvaluateStatementResult;
export declare function evaluateTranslationUnit(tu: TranslationUnit, scopes: Scope[], entryPoint: string): StackFrame;
export {};
`])}]])}],["stdlib",{type:"dir",contents:new Map([["builtins.d.ts",{type:"file",contents:new Blob([`import { Scope } from "../langsupport/glsl-language-server";
export declare const builtinSource: string;
export declare function getGLSLBuiltinsForReal(start: number, end: number, innerScopes: Scope[], fallthrough?: boolean): Promise<Scope>;
export declare function getGLSLBuiltins(start: number, end: number, innerScopes: Scope[], fallthrough?: boolean): Promise<Scope>;
`])}]])}],["langsupport",{type:"dir",contents:new Map([["glsl-language-server.d.ts",{type:"file",contents:new Blob([`import { GLSLType, TypeResult } from "../typechecker/glsltype";
import { ASTNode, Commented, Expr, ExternalDeclarationFunction, FullySpecifiedType, FunctionCallExpr, FunctionHeader, TranslationUnit } from "../parser/parser";
import { GLSLValue, StackFrame } from "../evaluator/evaluator";
import { FilesystemAdaptor } from "../../../filesystem/fs-protocol/FilesystemAdaptor";
export type GLSLAutocompleteOption = {
    str: string;
    type: "variable" | "function" | "type" | "keyword";
};
export type ScopeItem = {
    dataType: Commented<FullySpecifiedType>;
    name: Commented<string>;
    notUserVisible?: boolean;
    type: "variable";
} | {
    type: "function";
    globalScope: Scope;
    notUserVisible?: boolean;
    signatures: {
        type: "list";
        list: {
            fndef: Commented<ExternalDeclarationFunction>;
            scope: Scope;
        }[];
    } | {
        type: "function";
        typesig: (fncall: ASTNode<FunctionCallExpr>, params: {
            expr: ASTNode<Expr>;
            type: GLSLType | undefined;
        }[]) => TypeResult;
        evaluate: (params: GLSLValue[]) => GLSLValue;
    };
};
export type Scope = {
    items: Map<string, ScopeItem>;
    innerScopes: Scope[];
    innerScopeMap: Map<any, Scope>;
    start: number;
    end: number;
};
export type GLSLSemanticAnalysis = {
    translationUnit: TranslationUnit;
    globalScope: Scope;
    builtinScope: Scope;
};
export type GLSLSignatureHelp = {
    name: string;
    signature: Commented<FunctionHeader>;
};
export declare function scopeFind(scopes: Scope[], name: string): ScopeItem | undefined;
export declare function getScopeOf(scopes: Scope[], name: string): {
    scope: Scope;
    item: ScopeItem;
} | undefined;
export declare function getFunctionCallName(call: FunctionCallExpr): string;
export type GLSLDiagnostic = {
    start: number;
    end: number;
    why: string;
};
export declare function makeGLSLLanguageServer(context: {
    fs: FilesystemAdaptor;
}): {
    semanticallyAnalyzeGLSL(file: string, noStdlib: boolean, inject?: Map<string, ScopeItem>): Promise<GLSLSemanticAnalysis>;
    evaluate(file: string, functionName: string): Promise<StackFrame | undefined>;
    getDiagnostics(file: string, noStdlib?: boolean, inject?: Map<string, ScopeItem>): Promise<GLSLDiagnostic[]>;
    getSignatureHelp(file: string, pos: number): Promise<GLSLSignatureHelp | undefined>;
    getAutocompleteOptions(file: string, pos: number): Promise<GLSLAutocompleteOption[]>;
};
`])}]])}]])}]])}],["utilities",{type:"dir",contents:new Map([["result",{type:"dir",contents:new Map([["result.d.ts",{type:"file",contents:new Blob([`export type ResultSuccess<T> = {
    readonly success: true;
    readonly data: T;
};
export type ResultError<E> = {
    readonly success: false;
    readonly error: E;
};
export declare class Result<T, E> {
    readonly data: ResultSuccess<T> | ResultError<E>;
    constructor(data: ResultSuccess<T> | ResultError<E>);
    unsafeExpectSuccess(): T;
    mapS<T2>(f: (t: T) => T2): Result<T2, E>;
    mapE<E2>(f: (e: E) => E2): Result<T, E2>;
}
export declare function ok<T, E>(data: T): Result<T, E>;
export declare function err<T, E>(error: E): Result<T, E>;
export declare function splitSuccessesAndErrors<T, E>(results: Result<T, E>[]): [T[], E[]];
`])}]])}],["lens",{type:"dir",contents:new Map([["lens.d.ts",{type:"file",contents:new Blob([`type NestedKeyOf<T, K> = K extends [infer K1, ...infer Kr] ? K1 extends keyof T ? NestedKeyOf<T[K1], Kr> : never : K extends [] ? T : never;
export declare function setDeep<T, K extends [...string[]]>(t: T, path: K, v: (oldValue: NestedKeyOf<T, K>) => NestedKeyOf<T, K>): T;
type StringKeys<T> = {
    [Key in keyof T]: T[Key] extends string ? T[Key] : never;
};
type LensValue<T, Root> = (cb: (t: T) => T) => Root;
type LensPartial<T, Root> = (cb: (t: LensObject<T>) => Partial<T>) => Root;
type LensEach<T, Root, I> = (cb: (item: LensObject<I>, index: number, array: I[]) => I) => Root;
type LensMatch<T, Root> = <K extends keyof StringKeys<T>>(prop: K, matchers: ({
    [Key in (T[K] & string) | "$d"]?: Key extends "$d" ? (t: LensObject<T>) => T : (t: LensObject<T & {
        [Key2 in K]: Key;
    }>) => T;
} & {
    $d: (t: LensObject<T>) => T;
}) | {
    [Key in T[K] & string]: (t: LensObject<T & {
        [Key2 in K]: Key;
    }>) => T;
}) => Root;
type LensGet<T, Root> = <G>(cb: (t: T) => G) => G;
type WithLensMethods<T, Root> = T & {
    $: LensValue<T, Root>;
    $p: LensPartial<T, Root>;
    $f: LensObject<T, T>;
    $m: LensMatch<T, Root>;
    $g: LensGet<T, Root>;
} & (T extends (infer I)[] ? {
    $e: LensEach<T, Root, I>;
} : {});
type LensObject<T, Root = T> = {
    [K in keyof WithLensMethods<T, Root>]-?: K extends "$" ? LensValue<T, Root> : K extends "$p" ? LensPartial<T, Root> : K extends "$f" ? LensObject<T, T> : K extends "$e" ? T extends (infer I)[] ? LensEach<T, Root, I> : never : K extends "$m" ? LensMatch<T, Root> : K extends "$g" ? LensGet<T, Root> : undefined extends WithLensMethods<T, Root>[K] ? LensObject<WithLensMethods<T, Root>[K], Root> : LensObject<WithLensMethods<T, Root>[K], Root>;
};
export declare function lens<T, R = T>(t: T, path?: string[], root?: any): LensObject<T, R>;
export declare function id<T>(t: T): T;
export declare function delens<T>(t: LensObject<T>): T;
export {};
`])}]])}]])}],["filesystem",{type:"dir",contents:new Map([["fs-protocol",{type:"dir",contents:new Map([["FilesystemAdaptor.d.ts",{type:"file",contents:new Blob([`export type FilesystemAdaptor = {
    readDir: (path: string) => Promise<string[] | undefined>;
    isDir: (path: string) => Promise<boolean | undefined>;
    readFile: (path: string) => Promise<Blob | undefined>;
    writeFile: (path: string, contents: Blob) => Promise<Blob | undefined>;
    getDefaultPath: () => Promise<string>;
    watchFile: (path: string, callback: () => void) => () => void;
    watchPattern: (root: string, match: (path: string) => boolean, callback: (path: string) => void) => () => void;
};
export type SyncFilesystemAdaptor = {
    [Key in keyof FilesystemAdaptor]: (...args: Parameters<FilesystemAdaptor[Key]>) => Awaited<ReturnType<FilesystemAdaptor[Key]>>;
};
export type VirtualFilesystemTree = {
    type: "dir";
    name: string;
    contents: Map<string, VirtualFilesystemTree>;
} | {
    type: "file";
    name: string;
    contents: Blob;
};
`])}]])}],["fs-virtual",{type:"dir",contents:new Map([["FsVirtual.d.ts",{type:"file",contents:new Blob([`import { FilesystemAdaptor } from "../fs-protocol/FilesystemAdaptor";
export type VirtualFilesystemTree = {
    type: "dir";
    name: string;
    contents: Map<string, VirtualFilesystemTree>;
} | {
    type: "file";
    name: string;
    contents: Blob;
};
export declare function createVirtualFilesystem(tree: VirtualFilesystemTree): FilesystemAdaptor;
`])}]])}]])}]])}]])};var r=e;export{r as default};
//# sourceMappingURL=EvalboxDefsWrapper.js.map
