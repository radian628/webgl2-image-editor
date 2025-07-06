var e=`declare module "gl-abstraction-layer-lib/message-format" {
    type UIOptionMenu = {
        type: "menu";
        name?: string;
        desc?: string;
        fields: Record<string, UIOption>;
    };
    type UIOptionNumerical = {
        type: "float" | "int" | "uint";
        count: 1 | 2 | 3 | 4;
    };
    type UIOptionOrbitControls = {
        type: "orbit";
    };
    type UIOptionFirstPersonControls = {
        type: "first-person";
    };
    type UIOptionSelect = {
        type: "select";
        options: Record<string, UIOption>;
    };
    type Matrix4x4 = [
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
    export type UIOption = UIOptionMenu | UIOptionNumerical | UIOptionOrbitControls | UIOptionFirstPersonControls | UIOptionSelect;
    export type UIReturnType<T extends UIOption> = T extends UIOptionMenu ? {
        [Key in keyof T["fields"]]: UIReturnType<T["fields"][Key]>;
    } : T extends UIOptionNumerical ? T["count"] extends 1 ? number : T["count"] extends 2 ? [number, number] : T["count"] extends 3 ? [number, number, number] : T["count"] extends 4 ? [number, number, number, number] : never : T extends UIOptionOrbitControls ? {
        transform: Matrix4x4;
    } : T extends UIOptionFirstPersonControls ? {
        transform: Matrix4x4;
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
}
declare module "pipeline-assembler/pipeline-format" {
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
        format: GL["R8"] | GL["R8_SNORM"] | GL["RG8"] | GL["RG8_SNORM"] | GL["RGB8"] | GL["RGB8_SNORM"] | GL["RGB565"] | GL["RGBA4"] | GL["RGB5_A1"] | GL["RGBA8"] | GL["RGBA8_SNORM"] | GL["RGB10_A2"] | GL["RGB10_A2UI"] | GL["SRGB8"] | GL["SRGB8_ALPHA8"] | GL["R16F"] | GL["RG16F"] | GL["RGB16F"] | GL["RGBA16F"] | GL["R32F"] | GL["RG32F"] | GL["RGB32F"] | GL["RGBA32F"] | GL["R11F_G11F_B10F"] | GL["RGB9_E5"] | GL["R8I"] | GL["R8UI"] | GL["R16I"] | GL["R16UI"] | GL["R32I"] | GL["R32UI"] | GL["RG8I"] | GL["RG8UI"] | GL["RG16I"] | GL["RG16UI"] | GL["RG32I"] | GL["RG32UI"] | GL["RGB8I"] | GL["RGB8UI"] | GL["RGB16I"] | GL["RGB16UI"] | GL["RGB32I"] | GL["RGB32UI"] | GL["RGBA8I"] | GL["RGBA8UI"] | GL["RGBA16I"] | GL["RGBA16UI"] | GL["RGBA32I"] | GL["RGBA32UI"];
        width: number;
        height: number;
        type: GL["UNSIGNED_BYTE"] | GL["UNSIGNED_SHORT_5_6_5"] | GL["UNSIGNED_SHORT_4_4_4_4"] | GL["UNSIGNED_SHORT_5_5_5_1"] | GL["UNSIGNED_SHORT"] | GL["UNSIGNED_INT"] | GL["BYTE"] | GL["UNSIGNED_SHORT"] | GL["SHORT"] | GL["INT"] | GL["HALF_FLOAT"] | GL["FLOAT"] | GL["UNSIGNED_INT_2_10_10_10_REV"] | GL["UNSIGNED_INT_10F_11F_11F_REV"] | GL["UNSIGNED_INT_5_9_9_9_REV"] | GL["UNSIGNED_INT_24_8"] | GL["FLOAT_32_UNSIGNED_INT_24_8_REV"];
    };
    export type FramebufferNode = {
        type: "framebuffer";
        id: ID;
        attachments: {
            attachment: GL["COLOR_ATTACHMENT0"] | GL["COLOR_ATTACHMENT1"] | GL["COLOR_ATTACHMENT2"] | GL["COLOR_ATTACHMENT3"] | GL["COLOR_ATTACHMENT4"] | GL["COLOR_ATTACHMENT5"] | GL["COLOR_ATTACHMENT6"] | GL["COLOR_ATTACHMENT7"] | GL["COLOR_ATTACHMENT8"] | GL["COLOR_ATTACHMENT9"] | GL["COLOR_ATTACHMENT10"] | GL["COLOR_ATTACHMENT11"] | GL["COLOR_ATTACHMENT12"] | GL["COLOR_ATTACHMENT13"] | GL["COLOR_ATTACHMENT14"] | GL["COLOR_ATTACHMENT15"] | GL["DEPTH_ATTACHMENT"] | GL["STENCIL_ATTACHMENT"] | GL["DEPTH_STENCIL_ATTACHMENT"];
            texture: TextureFormat;
        }[];
    };
    export type BufferVectorArray = {
        type: "float";
        size: 1 | 2 | 3 | 4;
        datatype: GL["BYTE"] | GL["SHORT"] | GL["UNSIGNED_BYTE"] | GL["UNSIGNED_SHORT"] | GL["FLOAT"] | GL["HALF_FLOAT"] | GL["INT"] | GL["UNSIGNED_INT"] | GL["INT_2_10_10_10_REV"] | GL["UNSIGNED_INT_2_10_10_10_REV"];
        normalized: boolean;
        stride: GLsizei;
        offset: GLintptr;
    } | {
        type: "int";
        size: 1 | 2 | 3 | 4;
        datatype: GL["BYTE"] | GL["UNSIGNED_BYTE"] | GL["SHORT"] | GL["UNSIGNED_SHORT"] | GL["INT"] | GL["UNSIGNED_INT"];
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
}
declare module "components/iframe-runtime/GLMessageProtocol" {
    import { FilesystemAdaptor } from "../../filesystem/FilesystemAdaptor";
    import { UIOption, UIReturnType } from "gl-abstraction-layer-lib/message-format";
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
    export function typeNameToGLPrimitive(typename: string): GLPrimitive | undefined;
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
        menu: UIOption;
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
    } : Msg extends GLMessageType<"create-texture"> ? TextureRef : Msg extends GLMessageType<"create-menu"> ? MenuRef : Msg extends GLMessageType<"poll-menu"> ? UIReturnType<Msg["contents"]["menu"]> : undefined;
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
    export function executeGLMessage<Msg extends GLMessage>(msgwrapper: Msg, context: GLMessageContext): Promise<GLMessageResponse<Msg>>;
}
declare module "utils/result" {
    export type ResultSuccess<T> = {
        readonly success: true;
        readonly data: T;
    };
    export type ResultError<E> = {
        readonly success: false;
        readonly error: E;
    };
    export class Result<T, E> {
        readonly data: ResultSuccess<T> | ResultError<E>;
        constructor(data: ResultSuccess<T> | ResultError<E>);
        unsafeExpectSuccess(): T;
        mapS<T2>(f: (t: T) => T2): Result<T2, E>;
        mapE<E2>(f: (e: E) => E2): Result<T, E2>;
    }
    export function ok<T, E>(data: T): Result<T, E>;
    export function err<T, E>(error: E): Result<T, E>;
    export function splitSuccessesAndErrors<T, E>(results: Result<T, E>[]): [T[], E[]];
}
declare module "glsl-analyzer/glsl-keywords" {
    export const GLSL_KEYWORDS: string[];
    export const GLSL_SYMBOLS: string[];
}
declare module "glsl-analyzer/lexer" {
    export enum TokenKind {
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
    export const lexer: import("typescript-parsec").Lexer<TokenKind>;
}
declare module "glsl-analyzer/interleave-comments" {
    import { lrec_sc, Parser } from "typescript-parsec";
    import { TokenKind } from "glsl-analyzer/lexer";
    import { ASTNode, BinaryOpExpr, Comment, Commented } from "glsl-analyzer/parser";
    export function seq_interleave<I, TKind, T1, T2>(i: Parser<TKind, I>, p1: Parser<TKind, T1>, p2: Parser<TKind, T2>): Parser<TKind, [T1, I, T2]>;
    export function seq_interleave<I, TKind, T1, T2, T3>(i: Parser<TKind, I>, p1: Parser<TKind, T1>, p2: Parser<TKind, T2>, p3: Parser<TKind, T3>): Parser<TKind, [T1, I, T2, I, T3]>;
    export function seq_interleave<I, TKind, T1, T2, T3, T4>(i: Parser<TKind, I>, p1: Parser<TKind, T1>, p2: Parser<TKind, T2>, p3: Parser<TKind, T3>, p4: Parser<TKind, T4>): Parser<TKind, [T1, I, T2, I, T3, I, T4]>;
    export const rep_interleave_sc: typeof lrec_sc;
    export const comment_parser: Parser<TokenKind, Comment[]>;
    export function comment_before<T1>(p: Parser<TokenKind, T1>): Parser<TokenKind, [Comment[], T1]>;
    export function with_comment_before<T>(p: Parser<TokenKind, T>): Parser<TokenKind, Commented<T>>;
    export function nodeify<T>(p: Parser<TokenKind, T>): Parser<TokenKind, ASTNode<T>>;
    export function nodeify_commented<T>(p: Parser<TokenKind, Commented<T>>): Parser<TokenKind, ASTNode<T>>;
    export function commentify<T, U>(p: Parser<TokenKind, T>, convertToData: (t: T) => U, convertToComments: (t: T) => Comment[][]): Parser<TokenKind, Commented<U>>;
    export function commentify_no_comments_before<T, U>(p: Parser<TokenKind, T>, convertToData: (t: T) => U, convertToComments: (t: T) => Comment[][]): Parser<TokenKind, Commented<U>>;
    export function append_comments<T, U>(p: Parser<TokenKind, T>, convertToData: (t: T) => Commented<U>, convertToComments: (t: T) => Comment[][]): Parser<TokenKind, Commented<U>>;
    export function add_comments_and_transform<T, U, V>(p: Parser<TokenKind, T>, convertToOldCommented: (t: T) => Commented<U>, convertToData: (u: U, t: T) => V, mergeComments: (oldComments: Comment[][], t: T) => Comment[][]): Parser<TokenKind, Commented<V>>;
    export function stretch_node<T, U>(p: Parser<TokenKind, T>, node: (t: T) => ASTNode<U>, commentsBefore: (t: T) => Comment[][], commentsAfter: (t: T) => Comment[][]): Parser<TokenKind, ASTNode<U>>;
    export function custom_node<T, U>(p: Parser<TokenKind, T>, node: (t: T) => U, comments: (t: T) => Comment[][]): Parser<TokenKind, ASTNode<U>>;
    export function add_comments<T, U>(p: Parser<TokenKind, T>, node: (t: T) => ASTNode<U>, comments: (t: T, oldComments: Comment[][]) => Comment[][]): Parser<TokenKind, ASTNode<U>>;
    export function binop_generic<T, U>(left: Parser<TokenKind, ASTNode<T>>, right: Parser<TokenKind, U>, combine: (l: ASTNode<T>, r: U, start: number, end: number) => [T, Comment[][]]): Parser<TokenKind, ASTNode<T>>;
    export function binop<NodeType extends ASTNode<T>, T>(higher_prec: Parser<TokenKind, NodeType>, self_prec: Parser<TokenKind, ASTNode<T>>, ops: Parser<TokenKind, BinaryOpExpr["op"]>): Parser<TokenKind, ASTNode<BinaryOpExpr> | NodeType>;
}
declare module "glsl-analyzer/useful-combinators" {
    import { Parser } from "typescript-parsec";
    import { TokenKind } from "glsl-analyzer/lexer";
    import { ASTNode, Expr, Stmt } from "glsl-analyzer/parser";
    export function lstr<T extends string>(s: T): Parser<TokenKind, T>;
    export function errExprFallback(parser: Parser<TokenKind, ASTNode<Expr>>, err: string, parseAfter?: Parser<TokenKind, any>, errParser?: Parser<TokenKind, Expr>): Parser<TokenKind, ASTNode<Expr>>;
    export function errStmtFallback(parser: Parser<TokenKind, ASTNode<Stmt>>, err: string, parseAfter?: Parser<TokenKind, any>, errParser?: Parser<TokenKind, Stmt>): Parser<TokenKind, ASTNode<Stmt>>;
    export function failOnErrExpr(parser: Parser<TokenKind, ASTNode<Expr>>): Parser<TokenKind, ASTNode<Expr>>;
    export function fail_if<T>(parser: Parser<TokenKind, T>, fail: Parser<TokenKind, any>): Parser<TokenKind, T>;
    export function consumeUntil(parser: Parser<TokenKind, any>, after?: Parser<TokenKind, any>): Parser<TokenKind, undefined>;
}
declare module "glsl-analyzer/parser" {
    import { TokenKind } from "glsl-analyzer/lexer";
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
    export function dummyNode<T>(data: T, range?: {
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
    export const primary_expression: import("typescript-parsec").Rule<TokenKind, ASTNode<Expr>>;
    export const postfix_expression: import("typescript-parsec").Rule<TokenKind, ASTNode<Expr>>;
    export const integer_expression: import("typescript-parsec").Rule<TokenKind, ASTNode<Expr>>;
    export const function_call: import("typescript-parsec").Rule<TokenKind, ASTNode<Expr>>;
    export const function_call_generic: import("typescript-parsec").Rule<TokenKind, ASTNode<FunctionCallExpr>>;
    export const function_call_header_no_parameters: import("typescript-parsec").Rule<TokenKind, Commented<FunctionCallExpr>>;
    export const function_call_header_with_parameters: import("typescript-parsec").Rule<TokenKind, Commented<FunctionCallExpr>>;
    export const function_call_header: import("typescript-parsec").Rule<TokenKind, Commented<FunctionIdentifier>>;
    export const unary_expression: import("typescript-parsec").Rule<TokenKind, ASTNode<Expr>>;
    export const multiplicative_expression: import("typescript-parsec").Rule<TokenKind, ASTNode<Expr>>;
    export const and_expression: import("typescript-parsec").Rule<TokenKind, ASTNode<Expr>>;
    export const logical_or_expression: import("typescript-parsec").Rule<TokenKind, ASTNode<Expr>>;
    export const assignment_expression: import("typescript-parsec").Rule<TokenKind, ASTNode<Expr>>;
    export const expression: import("typescript-parsec").Rule<TokenKind, ASTNode<Expr>>;
    export const declaration: import("typescript-parsec").Rule<TokenKind, ASTNode<Declaration>>;
    export const function_prototype: import("typescript-parsec").Rule<TokenKind, Commented<FunctionHeader>>;
    export const parameter_declarator: import("typescript-parsec").Rule<TokenKind, Commented<ParameterDeclarator>>;
    export const init_declarator_list: import("typescript-parsec").Rule<TokenKind, Commented<InitDeclaratorList>>;
    export const fully_specified_type: import("typescript-parsec").Rule<TokenKind, Commented<FullySpecifiedType>>;
    export const layout_qualifier: import("typescript-parsec").Rule<TokenKind, Commented<LayoutQualifier>>;
    export const layout_qualifier_id: import("typescript-parsec").Rule<TokenKind, Commented<LayoutQualifierId>>;
    export const statement: import("typescript-parsec").Rule<TokenKind, ASTNode<Stmt>>;
    export const translation_unit: import("typescript-parsec").Rule<TokenKind, TranslationUnit>;
    export const external_declaration: import("typescript-parsec").Rule<TokenKind, ASTNode<ExternalDeclaration>>;
}
declare module "glsl-analyzer/parser-combined" {
    import { Parser, Token } from "typescript-parsec";
    import { Result } from "utils/result";
    import { TokenKind } from "glsl-analyzer/lexer";
    import { TranslationUnit } from "glsl-analyzer/parser";
    export type ParserResult = {
        translationUnit: TranslationUnit;
    };
    export type ParserError = {
        why: string;
    };
    export function lexGLSL(source: string): Result<Token<TokenKind> | undefined, ParserError>;
    export function tryParseGLSLRaw<T>(tokens: Token<TokenKind> | undefined, parser: Parser<TokenKind, T>): T;
    export function parseWith<T>(str: string, parser: Parser<TokenKind, T>): T;
    export function parseGLSLFragmentWithoutPreprocessing<T>(source: string, parser: Parser<TokenKind, T>): Result<T, ParserError>;
    export function parseGLSLWithoutPreprocessing(source: string): Result<ParserResult, ParserError>;
}
declare module "glsl-analyzer/get-inputs-outputs" {
    import { GLPrimitive, UniformType } from "components/iframe-runtime/GLMessageProtocol";
    import { TranslationUnit } from "glsl-analyzer/parser";
    export function getInputsOutputsAndUniforms(tu: TranslationUnit): {
        uniforms: Record<string, UniformType>;
        inputs: Record<string, GLPrimitive>;
        outputs: Record<string, GLPrimitive>;
    };
}
declare module "components/iframe-runtime/GLMessageClient" {
    import { GLMessage, GLMessageResponse, GLPrimitive, ShaderRef, ProgramRef, BufferInputRef, UniformTypeValue, TextureRef } from "components/iframe-runtime/GLMessageProtocol";
    export function createGLMessageClient(send: <Msg extends GLMessage>(msg: Msg) => Promise<GLMessageResponse<Msg>>): {
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
            uniforms: Record<string, import("components/iframe-runtime/GLMessageProtocol").UniformType>;
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
            uniforms: Record<string, import("components/iframe-runtime/GLMessageProtocol").UniformType>;
            shaderType: "vertex" | "fragment";
            id: string;
        }>;
    };
}
declare module "components/iframe-runtime/EvalboxDefs" {
    import { createGLMessageClient } from "components/iframe-runtime/GLMessageClient";
    import { ShaderRef } from "components/iframe-runtime/GLMessageProtocol";
    type GLMessageClient = ReturnType<typeof createGLMessageClient>;
    global {
        const clear: GLMessageClient["clear"];
        const createBufferFromArray: GLMessageClient["createBufferFromArray"];
        function linkProgram<VertexShader extends ShaderRef<"vertex">, FragmentShader extends ShaderRef<"fragment">>(vertex: VertexShader, fragment: FragmentShader): VertexShader["outputs"] extends FragmentShader["inputs"] ? FragmentShader["inputs"] extends VertexShader["outputs"] ? Promise<{
            inputs: VertexShader["inputs"];
            outputs: FragmentShader["outputs"];
            uniforms: VertexShader["uniforms"] & FragmentShader["uniforms"];
            id: string;
        }> : undefined : undefined;
        const sendGLMessage: GLMessageClient["sendGLMessage"];
        const draw: GLMessageClient["draw"];
        const create8BitRGBATexture: GLMessageClient["create8BitRGBATexture"];
        function loop(callback: (time: number) => any): () => void;
    }
}
`;var o=e;export{o as default};
//# sourceMappingURL=EvalboxDefsWrapper.js.map
