var e={type:"dir",contents:new Map([["src",{type:"dir",contents:new Map([["components",{type:"dir",contents:new Map([["iframe-runtime",{type:"dir",contents:new Map([["EvalboxUIWrapper.js",{type:"file",contents:new Blob([`"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ui = void 0;
var defaultFloatOptions = {
    type: "number",
    step: 0.0001,
    min: undefined,
    max: undefined,
    scaling: "log",
    sensitivity: 0.001,
};
var defaultIntOptions = {
    type: "number",
    step: 1,
    min: undefined,
    max: undefined,
    scaling: "log",
    sensitivity: 0.03,
};
var defaultUIntOptions = {
    type: "number",
    step: 1,
    min: 0,
    max: undefined,
    scaling: "log",
    sensitivity: 0.03,
};
exports.ui = {
    menu: function (name, fields, desc) {
        return {
            type: "menu",
            fields: fields,
            desc: desc,
        };
    },
    float: function (defaultValue, options) {
        return __assign(__assign({ count: 1, defaultValue: defaultValue }, defaultFloatOptions), options);
    },
    vec2: function (defaultValue, options) {
        return __assign(__assign({ count: 2, defaultValue: defaultValue }, defaultFloatOptions), options);
    },
    vec3: function (defaultValue, options) {
        return __assign(__assign({ count: 3, defaultValue: defaultValue }, defaultFloatOptions), options);
    },
    vec4: function (defaultValue, options) {
        return __assign(__assign({ count: 4, defaultValue: defaultValue }, defaultFloatOptions), options);
    },
    int: function (defaultValue, options) {
        return __assign(__assign({ count: 1, defaultValue: defaultValue }, defaultIntOptions), options);
    },
    ivec2: function (defaultValue, options) {
        return __assign(__assign({ count: 2, defaultValue: defaultValue }, defaultIntOptions), options);
    },
    ivec3: function (defaultValue, options) {
        return __assign(__assign({ count: 3, defaultValue: defaultValue }, defaultIntOptions), options);
    },
    ivec4: function (defaultValue, options) {
        return __assign(__assign({ count: 4, defaultValue: defaultValue }, defaultIntOptions), options);
    },
    uint: function (defaultValue, options) {
        return __assign(__assign({ count: 1, defaultValue: defaultValue }, defaultUIntOptions), options);
    },
    uvec2: function (defaultValue, options) {
        return __assign(__assign({ count: 2, defaultValue: defaultValue }, defaultUIntOptions), options);
    },
    uvec3: function (defaultValue, options) {
        return __assign(__assign({ count: 3, defaultValue: defaultValue }, defaultUIntOptions), options);
    },
    uvec4: function (defaultValue, options) {
        return __assign(__assign({ count: 4, defaultValue: defaultValue }, defaultUIntOptions), options);
    },
};
`])}],["EvalboxUIWrapper.d.ts",{type:"file",contents:new Blob([`import { UIOption } from "../GLMessageUI";
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
    menu<F extends Record<string, UIOption>>(name: string, fields: F, desc: string): UIOption;
    float(defaultValue: number, options?: FloatOptions): UIOption;
    vec2(defaultValue: [number, number], options?: FloatOptions): UIOption;
    vec3(defaultValue: [number, number, number], options?: FloatOptions): UIOption;
    vec4(defaultValue: [number, number, number, number], options?: FloatOptions): UIOption;
    int(defaultValue: number, options?: IntOptions): UIOption;
    ivec2(defaultValue: [number, number], options?: IntOptions): UIOption;
    ivec3(defaultValue: [number, number, number], options?: IntOptions): UIOption;
    ivec4(defaultValue: [number, number, number, number], options?: IntOptions): UIOption;
    uint(defaultValue: number, options?: IntOptions): UIOption;
    uvec2(defaultValue: [number, number], options?: IntOptions): UIOption;
    uvec3(defaultValue: [number, number, number], options?: IntOptions): UIOption;
    uvec4(defaultValue: [number, number, number, number], options?: IntOptions): UIOption;
};
export type UI = typeof ui;
`])}],["GLMessageProtocol.js",{type:"file",contents:new Blob([`"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.typeNameToGLPrimitive = typeNameToGLPrimitive;
exports.executeGLMessage = executeGLMessage;
var GLMessageUI_1 = require("../GLMessageUI");
function glp(count, type) {
    return { count: count, type: type };
}
function typeNameToGLPrimitive(typename) {
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
function createInterleavedBuffer(gl, format) {
    var _a;
    var buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    var maxlen = format.reduce(function (prev, curr) { return Math.max(prev, Math.ceil(curr.value.length / curr.count)); }, 0);
    var stride = format.reduce(function (prev, curr) { return prev + (curr.count * curr.size) / 8; }, 0);
    var offsets = format.reduce(function (prev, curr) { return prev.concat([prev.at(-1) + (curr.count * curr.size) / 8]); }, [0]);
    var bufferData = new ArrayBuffer(maxlen * stride);
    var view = new DataView(bufferData);
    for (var i = 0; i < maxlen; i++) {
        var baseIndex = stride * i;
        for (var j = 0; j < format.length; j++) {
            var offset = offsets[j];
            var formatItem = format[j];
            for (var k = 0; k < formatItem.count; k++) {
                var byteOffset = baseIndex + offset + (k * formatItem.size) / 8;
                var arrayIndex = i * formatItem.count + k;
                var arrayItem = (_a = formatItem.value.at(arrayIndex)) !== null && _a !== void 0 ? _a : 0;
                if (formatItem.encoding === "float") {
                    if (formatItem.size === 32) {
                        view.setFloat32(byteOffset, arrayItem, true);
                    }
                    else if (formatItem.size === 16) {
                        view.setFloat16(byteOffset, arrayItem, true);
                    }
                }
                else if (formatItem.encoding === "int" ||
                    formatItem.encoding === "normalized-int") {
                    if (formatItem.size === 32) {
                        view.setInt32(byteOffset, arrayItem, true);
                    }
                    else if (formatItem.size === 16) {
                        view.setInt16(byteOffset, arrayItem, true);
                    }
                    else {
                        view.setInt8(byteOffset, arrayItem);
                    }
                }
                else {
                    if (formatItem.size === 32) {
                        view.setUint32(byteOffset, arrayItem, true);
                    }
                    else if (formatItem.size === 16) {
                        view.setUint16(byteOffset, arrayItem, true);
                    }
                    else {
                        view.setUint8(byteOffset, arrayItem);
                    }
                }
            }
        }
    }
    gl.bufferData(gl.ARRAY_BUFFER, bufferData, gl.STATIC_DRAW);
    return buf;
}
function getVertexArrayType(gl, size, encoding) {
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
function executeGLMessage(msgwrapper, context) {
    return __awaiter(this, void 0, void 0, function () {
        var msg, gl, bitfield, buf, shader, program, program, _loop_1, _i, _a, _b, name_1, type, fbo, outputs, _c, outputs_1, _d, name_2, type, textureRef, location_1, tex, textureBindings, bindingIndex, _e, _f, _g, name_3, type, uniformData, tex, binding, loc, _h, _j, _k, name_4, type, uniformData, loc, uniformFunc, file, tex, currentValue, containerDims;
        var _l, _m, _o, _p;
        return __generator(this, function (_q) {
            switch (_q.label) {
                case 0:
                    // @ts-expect-error
                    if (!msgwrapper.contents)
                        return [2 /*return*/];
                    msg = msgwrapper.contents;
                    gl = context.gl;
                    if (!(msg.type === "clear")) return [3 /*break*/, 1];
                    bitfield = (msg.color ? gl.COLOR_BUFFER_BIT : 0) |
                        (msg.depth ? gl.DEPTH_BUFFER_BIT : 0) |
                        (msg.stencil ? gl.STENCIL_BUFFER_BIT : 0);
                    if (msg.color)
                        gl.clearColor.apply(gl, msg.color);
                    if (msg.depth)
                        gl.clearDepth(msg.depth);
                    if (msg.stencil)
                        gl.clearStencil(msg.stencil);
                    gl.clear(bitfield);
                    // @ts-expect-error
                    return [2 /*return*/, {
                            id: msgwrapper.id,
                        }];
                case 1:
                    if (!(msg.type === "create-buffer")) return [3 /*break*/, 2];
                    if (msg.source.type === "array") {
                        buf = createInterleavedBuffer(gl, msg.source.spec);
                        context.buffers.set(msg.id, buf);
                    }
                    return [2 /*return*/, {
                            // @ts-expect-error
                            content: { spec: msg.source.spec, id: msg.id },
                            id: msgwrapper.id,
                        }];
                case 2:
                    if (!(msg.type === "create-shader")) return [3 /*break*/, 3];
                    shader = gl.createShader(msg.source.shaderType === "vertex" ? gl.VERTEX_SHADER : gl.FRAGMENT_SHADER);
                    gl.shaderSource(shader, msg.source.text);
                    gl.compileShader(shader);
                    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
                        console.error(gl.getShaderInfoLog(shader));
                    }
                    context.shaders.set(msg.id, shader);
                    return [2 /*return*/, {
                            // @ts-expect-error
                            content: {
                                inputs: msg.source.inputs,
                                outputs: msg.source.outputs,
                                uniforms: msg.source.uniforms,
                                shaderType: msg.source.shaderType,
                                id: msg.id,
                            },
                            id: msgwrapper.id,
                        }];
                case 3:
                    if (!(msg.type === "create-program")) return [3 /*break*/, 4];
                    program = gl.createProgram();
                    gl.attachShader(program, context.shaders.get(msg.vertex.id));
                    gl.attachShader(program, context.shaders.get(msg.fragment.id));
                    gl.linkProgram(program);
                    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
                        console.error(gl.getProgramInfoLog(program));
                    }
                    context.programs.set(msg.id, program);
                    return [2 /*return*/, {
                            // @ts-expect-error
                            content: {
                                inputs: msg.vertex.inputs,
                                outputs: msg.fragment.outputs,
                                uniforms: __assign(__assign({}, msg.vertex.uniforms), msg.fragment.uniforms),
                                id: msg.id,
                            },
                            id: msgwrapper.id,
                        }];
                case 4:
                    if (!(msg.type === "draw")) return [3 /*break*/, 5];
                    program = context.programs.get(msg.program.id);
                    gl.useProgram(program);
                    _loop_1 = function (name_1, type) {
                        var bufferRef = msg.inputs[name_1];
                        var buf = context.buffers.get(bufferRef.buffer.id);
                        var input = bufferRef.buffer.spec.find(function (s) { return bufferRef.inputName === s.name; });
                        gl.bindBuffer(gl.ARRAY_BUFFER, buf);
                        var location_2 = gl.getAttribLocation(program, name_1);
                        gl.enableVertexAttribArray(location_2);
                        if (input.encoding === "float" ||
                            input.encoding === "normalized-int" ||
                            input.encoding === "normalized-uint") {
                            gl.vertexAttribPointer(location_2, input.count, getVertexArrayType(gl, input.size, input.encoding), input.encoding.startsWith("normalized"), input.stride, input.offset);
                        }
                        else if (input.encoding === "int" || input.encoding === "uint") {
                            gl.vertexAttribIPointer(location_2, input.count, getVertexArrayType(gl, input.size, input.encoding), input.stride, input.offset);
                        }
                    };
                    for (_i = 0, _a = Object.entries(msg.program.inputs); _i < _a.length; _i++) {
                        _b = _a[_i], name_1 = _b[0], type = _b[1];
                        _loop_1(name_1, type);
                    }
                    if (Object.entries(msg.program.outputs).length > 1 ||
                        msg.outputs[(_l = Object.keys(msg.program.outputs)) === null || _l === void 0 ? void 0 : _l[0]]) {
                        fbo = gl.createFramebuffer();
                        gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
                        outputs = Object.entries(msg.program.outputs);
                        for (_c = 0, outputs_1 = outputs; _c < outputs_1.length; _c++) {
                            _d = outputs_1[_c], name_2 = _d[0], type = _d[1];
                            textureRef = msg.outputs[name_2];
                            if (textureRef === null)
                                continue;
                            gl.viewport(0, 0, textureRef.width.pixels, textureRef.height.pixels);
                            location_1 = gl.getFragDataLocation(program, name_2);
                            tex = context.textures.get(textureRef.id);
                            gl.bindTexture(gl.TEXTURE_2D, tex);
                            gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0 + location_1, gl.TEXTURE_2D, tex, 0);
                        }
                        gl.drawBuffers(outputs.map(function (e, i) { return gl.COLOR_ATTACHMENT0 + i; }));
                    }
                    else {
                        gl.viewport(0, 0, context.canvas.width, context.canvas.height);
                        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
                    }
                    textureBindings = new Map();
                    bindingIndex = 0;
                    for (_e = 0, _f = Object.entries(msg.program.uniforms); _e < _f.length; _e++) {
                        _g = _f[_e], name_3 = _g[0], type = _g[1];
                        if (type.type !== "sampler")
                            continue;
                        uniformData = msg.uniforms[name_3];
                        tex = context.textures.get(uniformData.id);
                        binding = textureBindings.get(tex);
                        if (!binding) {
                            gl.activeTexture(gl.TEXTURE0 + bindingIndex);
                            // TODO: support other types of textures
                            gl.bindTexture(gl.TEXTURE_2D, tex);
                            textureBindings.set(tex, bindingIndex);
                            binding = bindingIndex;
                            bindingIndex++;
                        }
                        loc = gl.getUniformLocation(program, name_3);
                        gl.uniform1i(loc, binding);
                    }
                    for (_h = 0, _j = Object.entries(msg.program.uniforms); _h < _j.length; _h++) {
                        _k = _j[_h], name_4 = _k[0], type = _k[1];
                        if (type.type === "sampler")
                            continue;
                        uniformData = msg.uniforms[name_4];
                        if (!Array.isArray(uniformData))
                            uniformData = [uniformData];
                        loc = gl.getUniformLocation(program, name_4);
                        uniformFunc = {
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
                        }[type.type][type.count];
                        // @ts-expect-error
                        gl[uniformFunc].apply(gl, __spreadArray([loc], uniformData, false));
                    }
                    gl.drawArrays(gl.TRIANGLES, 0, msg.count);
                    // @ts-expect-error
                    return [2 /*return*/, {
                            id: msgwrapper.id,
                        }];
                case 5:
                    if (!(msg.type === "load-file")) return [3 /*break*/, 7];
                    return [4 /*yield*/, context.fs.readFile(msg.path)];
                case 6:
                    file = _q.sent();
                    return [2 /*return*/, {
                            id: msgwrapper.id,
                            // @ts-expect-error
                            content: {
                                file: file,
                            },
                        }];
                case 7:
                    if (msg.type === "create-texture") {
                        tex = gl.createTexture();
                        gl.bindTexture(gl.TEXTURE_2D, tex);
                        gl.texImage2D(gl.TEXTURE_2D, 0, msg.internalformat, msg.width, msg.height, 0, gl.RGBA, gl.UNSIGNED_BYTE, msg.pixels ? new Uint8Array(msg.pixels) : null);
                        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, msg.minFilter);
                        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, msg.magFilter);
                        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, msg.wrapS);
                        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, msg.wrapT);
                        context.textures.set(msg.id, tex);
                        return [2 /*return*/, {
                                id: msgwrapper.id,
                                // @ts-expect-error
                                content: {
                                    id: msg.id,
                                    width: { pixels: msg.width },
                                    height: { pixels: msg.height },
                                    dimensionality: "2D",
                                    format: "float",
                                },
                            }];
                    }
                    else if (msg.type === "create-menu") {
                        context.menus.set(msg.id, {
                            spec: msg.menu,
                            value: (0, GLMessageUI_1.getGLMessageUIDefaultValue)(msg.menu),
                        });
                        return [2 /*return*/, {
                                id: msgwrapper.id,
                                // @ts-expect-error
                                content: {
                                    id: msg.id,
                                    menu: msg.menu,
                                },
                            }];
                    }
                    else if (msg.type === "poll-menu") {
                        currentValue = (_m = context.menus.get(msg.id)) === null || _m === void 0 ? void 0 : _m.value;
                        return [2 /*return*/, {
                                id: msgwrapper.id,
                                content: currentValue,
                            }];
                    }
                    else if (msg.type === "resize") {
                        if (context.canvas.width !== msg.width)
                            context.canvas.width = msg.width;
                        if (context.canvas.height !== msg.height)
                            context.canvas.height = msg.height;
                        // @ts-expect-error
                        return [2 /*return*/, {
                                id: msgwrapper.id,
                            }];
                    }
                    else if (msg.type === "get-window-size") {
                        containerDims = (_p = (_o = context.container.current) === null || _o === void 0 ? void 0 : _o.getBoundingClientRect()) !== null && _p !== void 0 ? _p : {
                            width: 1,
                            height: 1,
                        };
                        return [2 /*return*/, {
                                id: msgwrapper.id,
                                // @ts-expect-error
                                content: {
                                    width: Math.ceil(containerDims.width),
                                    height: Math.ceil(containerDims.height),
                                },
                            }];
                    }
                    _q.label = 8;
                case 8: 
                // @ts-expect-error
                return [2 /*return*/];
            }
        });
    });
}
`])}],["GLMessageProtocol.d.ts",{type:"file",contents:new Blob([`import { FilesystemAdaptor } from "../../filesystem/FilesystemAdaptor";
import { UIOption, UIReturnType } from "../GLMessageUI";
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
export declare function typeNameToGLPrimitive(typename: string): GLPrimitive | undefined;
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
} : undefined;
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
    menus: Map<string, {
        spec: UIOption;
        value: any;
    }>;
    fs: FilesystemAdaptor;
    canvas: HTMLCanvasElement;
    container: {
        current: HTMLElement | null;
    };
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
export declare function executeGLMessage<Msg extends GLMessage>(msgwrapper: Msg, context: GLMessageContext): Promise<GLMessageResponse<Msg>>;
`])}],["GLMessageClient.js",{type:"file",contents:new Blob([`"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createGLMessageClient = createGLMessageClient;
var uuid_1 = require("uuid");
var parser_combined_1 = require("../../glsl-analyzer/parser-combined");
var get_inputs_outputs_1 = require("../../glsl-analyzer/get-inputs-outputs");
function createGLMessageClient(send) {
    return {
        clear: function (color, depth, stencil) {
            return send({
                contents: {
                    type: "clear",
                    color: color,
                    depth: depth,
                    stencil: stencil,
                },
                id: (0, uuid_1.v4)(),
            });
        },
        createBufferFromArray: function (params) {
            return __awaiter(this, void 0, void 0, function () {
                var count, encoding, size, array;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            count = params.count, encoding = params.encoding, size = params.size, array = params.array;
                            return [4 /*yield*/, send({
                                    id: (0, uuid_1.v4)(),
                                    contents: {
                                        type: "create-buffer",
                                        id: (0, uuid_1.v4)(),
                                        source: {
                                            type: "array",
                                            spec: [
                                                {
                                                    count: count,
                                                    encoding: encoding,
                                                    size: size,
                                                    value: array,
                                                    name: "attr",
                                                    stride: 0,
                                                    offset: 0,
                                                },
                                            ],
                                        },
                                    },
                                })];
                        case 1: return [2 /*return*/, (_a.sent()).content];
                    }
                });
            });
        },
        linkProgram: function (vertex, fragment) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, send({
                                id: (0, uuid_1.v4)(),
                                contents: {
                                    type: "create-program",
                                    id: (0, uuid_1.v4)(),
                                    vertex: vertex,
                                    fragment: fragment,
                                },
                            })];
                        case 1: return [2 /*return*/, (_a.sent()).content];
                    }
                });
            });
        },
        sendGLMessage: function (msg) {
            return send(msg);
        },
        draw: function (program, count, inputs, outputs, uniforms) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    return [2 /*return*/, send({
                            id: (0, uuid_1.v4)(),
                            contents: {
                                type: "draw",
                                program: program,
                                inputs: inputs,
                                outputs: outputs,
                                uniforms: uniforms,
                                count: count,
                            },
                        })];
                });
            });
        },
        create8BitRGBATexture: function (pixels, width, height) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, send({
                                id: (0, uuid_1.v4)(),
                                contents: {
                                    type: "create-texture",
                                    pixels: pixels,
                                    width: width,
                                    height: height,
                                    internalformat: WebGL2RenderingContext.RGBA8,
                                    minFilter: WebGL2RenderingContext.LINEAR,
                                    magFilter: WebGL2RenderingContext.LINEAR,
                                    wrapS: WebGL2RenderingContext.REPEAT,
                                    wrapT: WebGL2RenderingContext.REPEAT,
                                    id: (0, uuid_1.v4)(),
                                },
                            })];
                        case 1: return [2 /*return*/, (_a.sent()).content];
                    }
                });
            });
        },
        loadShader: function (path, type) {
            return __awaiter(this, void 0, void 0, function () {
                var shaderFile, text, textWithoutVersion, parsed, tu, shader;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, send({
                                id: (0, uuid_1.v4)(),
                                contents: {
                                    type: "load-file",
                                    path: path,
                                },
                            })];
                        case 1:
                            shaderFile = _a.sent();
                            if (!shaderFile.content.file)
                                return [2 /*return*/];
                            return [4 /*yield*/, shaderFile.content.file.text()];
                        case 2:
                            text = _a.sent();
                            textWithoutVersion = text.replace(/^.*\\#version 300 es/, "");
                            parsed = (0, parser_combined_1.parseGLSLWithoutPreprocessing)(textWithoutVersion);
                            if (!parsed.data.success)
                                return [2 /*return*/];
                            tu = parsed.data.data.translationUnit;
                            return [4 /*yield*/, send({
                                    id: (0, uuid_1.v4)(),
                                    contents: {
                                        type: "create-shader",
                                        source: __assign({ shaderType: type, text: text }, (0, get_inputs_outputs_1.getInputsOutputsAndUniforms)(tu)),
                                        id: (0, uuid_1.v4)(),
                                    },
                                })];
                        case 3:
                            shader = _a.sent();
                            return [2 /*return*/, shader.content];
                    }
                });
            });
        },
        createMenu: function (menu) {
            return __awaiter(this, void 0, void 0, function () {
                var res;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, send({
                                id: (0, uuid_1.v4)(),
                                contents: {
                                    type: "create-menu",
                                    menu: menu,
                                    id: (0, uuid_1.v4)(),
                                },
                            })];
                        case 1:
                            res = _a.sent();
                            return [2 /*return*/, res.content];
                    }
                });
            });
        },
        pollMenu: function (menu) {
            return __awaiter(this, void 0, void 0, function () {
                var res;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, send({
                                id: (0, uuid_1.v4)(),
                                contents: {
                                    type: "poll-menu",
                                    id: menu.id,
                                    menu: menu,
                                },
                            })];
                        case 1:
                            res = _a.sent();
                            return [2 /*return*/, res.content];
                    }
                });
            });
        },
        getWindowSize: function () {
            return __awaiter(this, void 0, void 0, function () {
                var res;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, send({
                                id: (0, uuid_1.v4)(),
                                contents: {
                                    type: "get-window-size",
                                },
                            })];
                        case 1:
                            res = _a.sent();
                            return [2 /*return*/, res.content];
                    }
                });
            });
        },
        resize: function (width, height) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, send({
                                id: (0, uuid_1.v4)(),
                                contents: {
                                    type: "resize",
                                    width: width,
                                    height: height,
                                },
                            })];
                        case 1:
                            _a.sent();
                            return [2 /*return*/];
                    }
                });
            });
        },
    };
}
`])}],["GLMessageClient.d.ts",{type:"file",contents:new Blob([`import { GLMessage, GLMessageResponse, GLPrimitive, ShaderRef, ProgramRef, BufferInputRef, UniformTypeValue, TextureRef, MenuRef } from "./GLMessageProtocol";
import { UIOption, UIReturnType } from "../GLMessageUI";
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
        uniforms: Record<string, import("./GLMessageProtocol").UniformType>;
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
        uniforms: Record<string, import("./GLMessageProtocol").UniformType>;
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
};
`])}],["EvalboxDefs.js",{type:"file",contents:new Blob([`"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
`])}],["EvalboxDefs.d.ts",{type:"file",contents:new Blob([`import { UIOption, UIReturnType } from "../GLMessageUI";
import * as userInterface from "./EvalboxUIWrapper";
import { createGLMessageClient } from "./GLMessageClient";
import { ShaderRef } from "./GLMessageProtocol";
import * as glm from "./GLMessageProtocol";
type GLMessageClient = ReturnType<typeof createGLMessageClient>;
declare global {
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
    const createMenu: <UI extends UIOption>(menu: UI) => Promise<{
        id: string;
        menu: UI;
    }>;
    type UIOptionMenu = {
        type: "menu";
        name?: string;
        desc?: string;
        fields: Record<string, UIOption>;
    };
    type UIOptionNumerical = {
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
    const pollMenu: <T extends UIOption>(menu: {
        menu: T;
        id: string;
    }) => Promise<UIReturnType<T>>;
    const ui: Omit<userInterface.UI, "menu" | "float" | "vec2" | "int"> & {
        menu: <F extends Record<string, UIOption>>(name: string, fields: F, desc: string) => {
            type: "menu";
            fields: F;
            desc: string;
        };
        float: (defaultValue: number, options?: userInterface.FloatOptions) => {
            type: "number";
            count: 1;
            defaultValue: number;
        };
        int: (defaultValue: number, options?: userInterface.FloatOptions) => {
            type: "number";
            count: 1;
            defaultValue: number;
        };
        vec2: (defaultValue: [number, number], options?: userInterface.FloatOptions) => {
            type: "number";
            count: 2;
            defaultValue: [number, number];
        };
    };
    type UniformType = glm.UniformType;
    type UniformsToValues<G extends Record<string, UniformType>> = glm.UniformsToValues<G>;
    const resize: GLMessageClient["resize"];
    const getWindowSize: GLMessageClient["getWindowSize"];
}
export type PleaseWorkFFS<T extends UIOption> = UIOption extends UIOptionNumerical ? UIReturnType<T> : UIReturnType<T>;
export {};
`])}]])}]])}],["pipeline-assembler",{type:"dir",contents:new Map([["pipeline-format.js",{type:"file",contents:new Blob([`"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
`])}],["pipeline-format.d.ts",{type:"file",contents:new Blob([`type ID = string;
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
export {};
`])}]])}],["utils",{type:"dir",contents:new Map([["result.js",{type:"file",contents:new Blob([`"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Result = void 0;
exports.ok = ok;
exports.err = err;
exports.splitSuccessesAndErrors = splitSuccessesAndErrors;
var Result = /** @class */ (function () {
    function Result(data) {
        this.data = data;
    }
    Result.prototype.unsafeExpectSuccess = function () {
        if (this.data.success)
            return this.data.data;
        throw new Error("Expected a non-error response from a Result!");
    };
    Result.prototype.mapS = function (f) {
        if (this.data.success)
            return new Result({
                success: true,
                data: f(this.data.data),
            });
        // @ts-expect-error T and T2 only matter if this is a ResultSuccess
        return this;
    };
    Result.prototype.mapE = function (f) {
        if (!this.data.success)
            return new Result({
                success: false,
                error: f(this.data.error),
            });
        // @ts-expect-error T and T2 only matter if this is a ResultSuccess
        return this;
    };
    return Result;
}());
exports.Result = Result;
function ok(data) {
    return new Result({ success: true, data: data });
}
function err(error) {
    return new Result({ success: false, error: error });
}
function splitSuccessesAndErrors(results) {
    var successes = [];
    var errors = [];
    for (var _i = 0, results_1 = results; _i < results_1.length; _i++) {
        var r = results_1[_i];
        if (r.data.success) {
            successes.push(r.data.data);
        }
        else {
            errors.push(r.data.error);
        }
    }
    return [successes, errors];
}
`])}],["result.d.ts",{type:"file",contents:new Blob([`export type ResultSuccess<T> = {
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
`])}]])}],["glsl-analyzer",{type:"dir",contents:new Map([["glsl-keywords.js",{type:"file",contents:new Blob([`"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GLSL_SYMBOLS = exports.GLSL_KEYWORDS = void 0;
exports.GLSL_KEYWORDS = [
    // copied from grammar
    "const",
    "bool",
    "float",
    "int",
    "uint",
    "break",
    "continue",
    "do",
    "else",
    "for",
    "if",
    "discard",
    "return",
    "switch",
    "case",
    "default",
    "bvec2",
    "bvec3",
    "bvec4",
    "ivec2",
    "ivec3",
    "ivec4",
    "uvec2",
    "uvec3",
    "uvec4",
    "vec2",
    "vec3",
    "vec4",
    "mat2",
    "mat3",
    "mat4",
    "centroid",
    "in",
    "out",
    "inout",
    "uniform",
    "flat",
    "smooth",
    "layout",
    "mat2x2",
    "mat2x3",
    "mat2x4",
    "mat3x2",
    "mat3x3",
    "mat3x4",
    "mat4x2",
    "mat4x3",
    "mat4x4",
    "sampler2d",
    "sampler3d",
    "samplercube",
    "sampler2dshadow",
    "samplercubeshadow",
    "sampler2darray",
    "sampler2darrayshadow",
    "isampler2d",
    "isampler3d",
    "isamplercube",
    "isampler2darray",
    "usampler2d",
    "usampler3d",
    "usamplercube",
    "usampler2darray",
    "struct",
    "void",
    "while",
    "invariant",
    "highp",
    "mediump",
    "lowp",
    "true",
    "false",
    // taken from elsewhere
    "shared",
    "packed",
    "std140",
    "row_major",
    "column_major",
];
exports.GLSL_SYMBOLS = [
    "*=",
    "/=",
    "%=",
    "+=",
    "-=",
    "<<=",
    ">>=",
    "&=",
    "^=",
    "|=",
    "++",
    "--",
    "==",
    "!=",
    ">=",
    "<=",
    "&&",
    "||",
    "^^",
    "<<",
    ">>",
    "(",
    ")",
    "[",
    "]",
    "{",
    "}",
    ".",
    ",",
    ":",
    "=",
    ";",
    "!",
    "-",
    "~",
    "+",
    "*",
    "/",
    "%",
    "<",
    ">",
    "|",
    "^",
    "&",
    "?",
];
`])}],["glsl-keywords.d.ts",{type:"file",contents:new Blob([`export declare const GLSL_KEYWORDS: string[];
export declare const GLSL_SYMBOLS: string[];
`])}],["lexer.js",{type:"file",contents:new Blob([`"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.lexer = exports.TokenKind = void 0;
var typescript_parsec_1 = require("typescript-parsec");
var glsl_keywords_1 = require("./glsl-keywords");
var TokenKind;
(function (TokenKind) {
    TokenKind[TokenKind["Symbol"] = 0] = "Symbol";
    TokenKind[TokenKind["Keyword"] = 1] = "Keyword";
    TokenKind[TokenKind["Whitespace"] = 2] = "Whitespace";
    TokenKind[TokenKind["Comment"] = 3] = "Comment";
    TokenKind[TokenKind["Identifier"] = 4] = "Identifier";
    TokenKind[TokenKind["IntegerDecimal"] = 5] = "IntegerDecimal";
    TokenKind[TokenKind["IntegerOctal"] = 6] = "IntegerOctal";
    TokenKind[TokenKind["IntegerHex"] = 7] = "IntegerHex";
    TokenKind[TokenKind["Float"] = 8] = "Float";
    TokenKind[TokenKind["ImportString"] = 9] = "ImportString";
})(TokenKind || (exports.TokenKind = TokenKind = {}));
exports.lexer = (0, typescript_parsec_1.buildLexer)([
    // all keywords
    [
        true,
        new RegExp(glsl_keywords_1.GLSL_KEYWORDS.map(function (k) { return "^".concat(k); }).join("|"), "g"),
        TokenKind.Keyword,
    ],
    // all symbols
    [
        true,
        new RegExp("^(".concat(glsl_keywords_1.GLSL_SYMBOLS.map(function (s) {
            return s
                .split("")
                .map(function (c) { return "\\\\".concat(c); })
                .join("");
        }).join("|"), ")"), "g"),
        TokenKind.Symbol,
    ],
    // whitespace
    [false, /^\\s+/g, TokenKind.Whitespace],
    // comments (comments will be included in AST)
    [true, /^(\\/\\/[^\\n]*\\n)|^(\\/\\*[\\s\\S]*?\\*\\/)/g, TokenKind.Comment],
    // identifiers
    [true, /^[a-zA-Z_][a-zA-Z0-9_]*/g, TokenKind.Identifier],
    // ints
    [true, /^[1-9][0-9]*[uU]?/g, TokenKind.IntegerDecimal],
    [true, /^0[0-7]*[uU]?/g, TokenKind.IntegerOctal],
    [true, /^0[xX][0-9a-fA-F]+[uU]?/g, TokenKind.IntegerHex],
    // floats
    [
        true,
        /^([0-9]+\\.[0-9]*|\\.[0-9]+)([eE][\\+\\-]?[0-9]+)?[fF]?/g,
        TokenKind.Float,
    ],
    [true, /^[0-9]+[eE][\\+\\-][0-9]+[fF]?/g, TokenKind.Float],
    // import strings
    [true, /^"[^"]*"/g, TokenKind.ImportString],
]);
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
`])}],["interleave-comments.js",{type:"file",contents:new Blob([`"use strict";
// how to ensure that comments will always be counted?:
// make sure that all sequences of tokens (i.e. ones that can contain comments)
// always ALWAYS allow for interleaving of comments
// for instance this means no seq allowed and no rep allowed.
// both of these must instead either manually interleave comments
// or I must make versions that automatically do it.
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.comment_parser = exports.rep_interleave_sc = void 0;
exports.seq_interleave = seq_interleave;
exports.comment_before = comment_before;
exports.with_comment_before = with_comment_before;
exports.nodeify = nodeify;
exports.nodeify_commented = nodeify_commented;
exports.commentify = commentify;
exports.commentify_no_comments_before = commentify_no_comments_before;
exports.append_comments = append_comments;
exports.add_comments_and_transform = add_comments_and_transform;
exports.stretch_node = stretch_node;
exports.custom_node = custom_node;
exports.add_comments = add_comments;
exports.binop_generic = binop_generic;
exports.binop = binop;
var typescript_parsec_1 = require("typescript-parsec");
var lexer_1 = require("./lexer");
function seq_interleave(i) {
    var ps = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        ps[_i - 1] = arguments[_i];
    }
    return typescript_parsec_1.seq.apply(void 0, __spreadArray([ps[0]], ps
        .slice(1)
        .map(function (p) { return [i, p]; })
        .flat(1), false));
}
exports.rep_interleave_sc = typescript_parsec_1.lrec_sc;
exports.comment_parser = (0, typescript_parsec_1.apply)((0, typescript_parsec_1.rep_sc)((0, typescript_parsec_1.tok)(lexer_1.TokenKind.Comment)), function (c) {
    return c.map(function (c) { return ({ comment: c.text }); });
});
function comment_before(p) {
    return (0, typescript_parsec_1.seq)(exports.comment_parser, p);
}
function with_comment_before(p) {
    return commentify(p, function (s) { return s; }, function (c) { return []; });
}
function nodeify(p) {
    return (0, typescript_parsec_1.apply)(comment_before(p), function (_a, _b) {
        var comments = _a[0], data = _a[1];
        var start = _b[0], end = _b[1];
        return ({
            data: data,
            comments: [comments],
            range: { start: start === null || start === void 0 ? void 0 : start.pos.index, end: end === null || end === void 0 ? void 0 : end.pos.index },
            _isNode: true,
        });
    });
}
function nodeify_commented(p) {
    return (0, typescript_parsec_1.apply)(p, function (data, _a) {
        var start = _a[0], end = _a[1];
        return ({
            data: data.data,
            comments: __spreadArray([], data.comments, true),
            range: { start: start === null || start === void 0 ? void 0 : start.pos.index, end: end === null || end === void 0 ? void 0 : end.pos.index },
            _isNode: true,
        });
    });
}
function commentify(p, convertToData, convertToComments) {
    return (0, typescript_parsec_1.apply)(comment_before(p), function (_a) {
        var comments = _a[0], data = _a[1];
        return ({
            data: convertToData(data),
            comments: __spreadArray([comments], convertToComments(data), true),
        });
    });
}
function commentify_no_comments_before(p, convertToData, convertToComments) {
    return (0, typescript_parsec_1.apply)(p, function (data) { return ({
        data: convertToData(data),
        comments: __spreadArray([], convertToComments(data), true),
    }); });
}
function append_comments(p, convertToData, convertToComments) {
    return (0, typescript_parsec_1.apply)(comment_before(p), function (_a) {
        var comments = _a[0], data = _a[1];
        var underlyingNode = convertToData(data);
        return {
            data: underlyingNode.data,
            comments: __spreadArray(__spreadArray([
                comments
            ], underlyingNode.comments, true), convertToComments(data), true),
        };
    });
}
function add_comments_and_transform(p, convertToOldCommented, convertToData, mergeComments) {
    return (0, typescript_parsec_1.apply)(comment_before(p), function (_a) {
        var comments = _a[0], data = _a[1];
        var oldCommented = convertToOldCommented(data);
        return {
            data: convertToData(oldCommented.data, data),
            comments: __spreadArray([comments], mergeComments(oldCommented.comments, data), true),
        };
    });
}
// okay in hindsight this really shouldn't be necessary
// i shouldn't have to stretch any nodes
function stretch_node(p, node, commentsBefore, commentsAfter) {
    return (0, typescript_parsec_1.apply)(comment_before(p), function (_a, _b) {
        var comments = _a[0], data = _a[1];
        var start = _b[0], end = _b[1];
        return (__assign(__assign({}, node(data)), { comments: __spreadArray(__spreadArray(__spreadArray([
                comments
            ], commentsBefore(data), true), node(data).comments, true), commentsAfter(data), true), range: { start: start === null || start === void 0 ? void 0 : start.pos.index, end: end === null || end === void 0 ? void 0 : end.pos.index } }));
    });
}
function custom_node(p, node, comments) {
    return (0, typescript_parsec_1.apply)(p, function (data, _a) {
        var start = _a[0], end = _a[1];
        return ({
            data: node(data),
            comments: comments(data),
            range: { start: start === null || start === void 0 ? void 0 : start.pos.index, end: end === null || end === void 0 ? void 0 : end.pos.index },
            _isNode: true,
        });
    });
}
function add_comments(p, node, comments) {
    return (0, typescript_parsec_1.apply)(p, function (data, _a) {
        var start = _a[0], end = _a[1];
        var astnode = node(data);
        var newcomments = comments(data, astnode.comments);
        return __assign(__assign({}, astnode), { comments: newcomments });
    });
}
function binop_generic(left, right, combine
// no_sc?: boolean
) {
    var combine_and_nodeify = function (l, r, start, end) {
        var _a = combine(l, r, start, end), data = _a[0], comments = _a[1];
        return {
            data: data,
            comments: comments,
            range: { start: start, end: end },
            _isNode: true,
        };
    };
    return (
    // combined lrec case
    (0, typescript_parsec_1.lrec_sc)((0, typescript_parsec_1.apply)((0, typescript_parsec_1.seq)(left, right), function (_a, _b) {
        var l = _a[0], r = _a[1];
        var s = _b[0], e = _b[1];
        return combine_and_nodeify(l, r, s === null || s === void 0 ? void 0 : s.pos.index, e === null || e === void 0 ? void 0 : e.pos.index);
    }), (0, typescript_parsec_1.apply)(right, function (data, _a) {
        var start = _a[0], end = _a[1];
        return ({ data: data, start: start, end: end });
    }), function (l, r) { var _a; return combine_and_nodeify(l, r.data, l.range.start, (_a = r.end) === null || _a === void 0 ? void 0 : _a.pos.index); }));
}
function binop(higher_prec, self_prec, ops) {
    return (0, typescript_parsec_1.lrec_sc)(higher_prec, (0, typescript_parsec_1.seq)(exports.comment_parser, ops, higher_prec), function (left, right) {
        var binopNode = {
            type: "binary-op",
            op: right[1],
            left: left,
            right: right[2],
            _isExpr: true,
        };
        return {
            data: binopNode,
            comments: [right[0]],
            range: { start: left.range.start, end: right[2].range.end },
            _isNode: true,
        };
    });
}
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
`])}],["useful-combinators.js",{type:"file",contents:new Blob([`"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.lstr = lstr;
exports.errExprFallback = errExprFallback;
exports.errStmtFallback = errStmtFallback;
exports.failOnErrExpr = failOnErrExpr;
exports.fail_if = fail_if;
exports.consumeUntil = consumeUntil;
var typescript_parsec_1 = require("typescript-parsec");
var interleave_comments_1 = require("./interleave-comments");
function lstr(s) {
    return (0, typescript_parsec_1.apply)((0, typescript_parsec_1.str)(s), function (s) { return s.text; });
}
function errExprFallback(parser, err, parseAfter, errParser) {
    return (0, typescript_parsec_1.alt_sc)(parser, (0, interleave_comments_1.nodeify)((0, typescript_parsec_1.kleft)(errParser
        ? errParser
        : (0, typescript_parsec_1.apply)((0, typescript_parsec_1.nil)(), function () {
            return {
                type: "error",
                errorType: "expr",
                _isExpr: true,
                _isError: true,
                why: err,
            };
        }), parseAfter !== null && parseAfter !== void 0 ? parseAfter : (0, typescript_parsec_1.nil)())));
}
function errStmtFallback(parser, err, parseAfter, errParser) {
    return (0, typescript_parsec_1.alt_sc)(parser, (0, interleave_comments_1.nodeify)((0, typescript_parsec_1.kleft)(errParser
        ? errParser
        : (0, typescript_parsec_1.apply)((0, typescript_parsec_1.nil)(), function () {
            return {
                type: "error",
                errorType: "stmt",
                _isStmt: true,
                _isError: true,
                why: err,
            };
        }), parseAfter !== null && parseAfter !== void 0 ? parseAfter : (0, typescript_parsec_1.nil)())));
}
function failOnErrExpr(parser) {
    return {
        parse: function (tok) {
            var parsed = parser.parse(tok);
            if (parsed.successful) {
                var res = parsed.candidates[0];
                if (res.result.data.type === "error") {
                    return {
                        successful: false,
                        error: {
                            kind: "Error",
                            pos: tok === null || tok === void 0 ? void 0 : tok.pos,
                            message: "",
                        },
                    };
                }
                else {
                    return parsed;
                }
            }
            else {
                return parsed;
            }
        },
    };
}
function fail_if(parser, fail) {
    return {
        parse: function (tok) {
            var _a, _b, _c, _d, _e, _f;
            var parsed = parser.parse(tok);
            var shouldFail = fail.parse(tok);
            if (!parsed.successful)
                return parsed;
            if (shouldFail.successful) {
                var failPos = (_c = (_b = (_a = shouldFail.candidates[0].nextToken) === null || _a === void 0 ? void 0 : _a.pos) === null || _b === void 0 ? void 0 : _b.index) !== null && _c !== void 0 ? _c : Infinity;
                var successPos = (_f = (_e = (_d = parsed.candidates[0].nextToken) === null || _d === void 0 ? void 0 : _d.pos) === null || _e === void 0 ? void 0 : _e.index) !== null && _f !== void 0 ? _f : Infinity;
                if (failPos >= successPos) {
                    return {
                        successful: false,
                        error: {
                            kind: "Error",
                            message: "Matched failure check parser.",
                            pos: tok === null || tok === void 0 ? void 0 : tok.pos,
                        },
                    };
                }
            }
            return parsed;
        },
    };
}
function consumeUntil(parser, after) {
    return (0, typescript_parsec_1.combine)((0, typescript_parsec_1.alt_sc)(parser, after
        ? {
            parse: function (tok) {
                var afterResult = after.parse(tok);
                if (afterResult.successful) {
                    return __assign(__assign({}, afterResult), { candidates: afterResult.candidates.map(function (c) { return ({
                            firstToken: c.firstToken,
                            nextToken: c.firstToken,
                            result: true,
                        }); }) });
                }
                else {
                    return {
                        candidates: [
                            {
                                firstToken: tok,
                                nextToken: tok,
                                result: false,
                            },
                        ],
                        successful: true,
                        error: undefined,
                    };
                }
            },
        }
        : (0, typescript_parsec_1.nil)()), function (t) {
        return t
            ? // if we've found the pattern, stop
                (0, typescript_parsec_1.nil)()
            : // otherwise, consume a token
                {
                    parse: function (tok) {
                        if (tok) {
                            return {
                                successful: true,
                                candidates: [
                                    {
                                        firstToken: tok,
                                        nextToken: tok.next,
                                        result: true,
                                    },
                                ],
                                error: undefined,
                            };
                        }
                        else {
                            return {
                                successful: true,
                                candidates: [
                                    {
                                        firstToken: tok,
                                        nextToken: tok,
                                        result: false,
                                    },
                                ],
                                error: undefined,
                            };
                        }
                    },
                };
    }, 
    // if we were able to consume a token, try to find the pattern again
    // otherwise just stop
    function (t) { return (t ? consumeUntil(parser, after) : (0, typescript_parsec_1.nil)()); });
}
`])}],["useful-combinators.d.ts",{type:"file",contents:new Blob([`import { Parser } from "typescript-parsec";
import { TokenKind } from "./lexer";
import { ASTNode, Expr, Stmt } from "./parser";
export declare function lstr<T extends string>(s: T): Parser<TokenKind, T>;
export declare function errExprFallback(parser: Parser<TokenKind, ASTNode<Expr>>, err: string, parseAfter?: Parser<TokenKind, any>, errParser?: Parser<TokenKind, Expr>): Parser<TokenKind, ASTNode<Expr>>;
export declare function errStmtFallback(parser: Parser<TokenKind, ASTNode<Stmt>>, err: string, parseAfter?: Parser<TokenKind, any>, errParser?: Parser<TokenKind, Stmt>): Parser<TokenKind, ASTNode<Stmt>>;
export declare function failOnErrExpr(parser: Parser<TokenKind, ASTNode<Expr>>): Parser<TokenKind, ASTNode<Expr>>;
export declare function fail_if<T>(parser: Parser<TokenKind, T>, fail: Parser<TokenKind, any>): Parser<TokenKind, T>;
export declare function consumeUntil(parser: Parser<TokenKind, any>, after?: Parser<TokenKind, any>): Parser<TokenKind, undefined>;
`])}],["parser.js",{type:"file",contents:new Blob([`"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.external_declaration = exports.translation_unit = exports.statement = exports.layout_qualifier_id = exports.layout_qualifier = exports.fully_specified_type = exports.init_declarator_list = exports.parameter_declarator = exports.function_prototype = exports.declaration = exports.expression = exports.assignment_expression = exports.logical_or_expression = exports.and_expression = exports.multiplicative_expression = exports.unary_expression = exports.function_call_header = exports.function_call_header_with_parameters = exports.function_call_header_no_parameters = exports.function_call_generic = exports.function_call = exports.integer_expression = exports.postfix_expression = exports.primary_expression = void 0;
exports.dummyNode = dummyNode;
var typescript_parsec_1 = require("typescript-parsec");
var lexer_1 = require("./lexer");
var interleave_comments_1 = require("./interleave-comments");
var useful_combinators_1 = require("./useful-combinators");
function dummyNode(data, range) {
    return {
        data: data,
        comments: [],
        range: range !== null && range !== void 0 ? range : { start: 0, end: 0 },
        _isNode: true,
    };
}
function glslParseInt(str) {
    throw new Error("TODO");
}
var variable_identifier = (0, typescript_parsec_1.rule)();
exports.primary_expression = (0, typescript_parsec_1.rule)();
exports.postfix_expression = (0, typescript_parsec_1.rule)();
exports.integer_expression = (0, typescript_parsec_1.rule)();
exports.function_call = (0, typescript_parsec_1.rule)();
var function_call_or_method = (0, typescript_parsec_1.rule)();
exports.function_call_generic = (0, typescript_parsec_1.rule)();
exports.function_call_header_no_parameters = (0, typescript_parsec_1.rule)();
exports.function_call_header_with_parameters = (0, typescript_parsec_1.rule)();
exports.function_call_header = (0, typescript_parsec_1.rule)();
var function_identifier = (0, typescript_parsec_1.rule)();
exports.unary_expression = (0, typescript_parsec_1.rule)();
var unary_operator = (0, typescript_parsec_1.rule)();
exports.multiplicative_expression = (0, typescript_parsec_1.rule)();
var additive_expression = (0, typescript_parsec_1.rule)();
var shift_expression = (0, typescript_parsec_1.rule)();
var relational_expression = (0, typescript_parsec_1.rule)();
var equality_expression = (0, typescript_parsec_1.rule)();
exports.and_expression = (0, typescript_parsec_1.rule)();
var exclusive_or_expression = (0, typescript_parsec_1.rule)();
var inclusive_or_expression = (0, typescript_parsec_1.rule)();
var logical_and_expression = (0, typescript_parsec_1.rule)();
var logical_xor_expression = (0, typescript_parsec_1.rule)();
exports.logical_or_expression = (0, typescript_parsec_1.rule)();
var conditional_expression = (0, typescript_parsec_1.rule)();
exports.assignment_expression = (0, typescript_parsec_1.rule)();
var assignment_operator = (0, typescript_parsec_1.rule)();
exports.expression = (0, typescript_parsec_1.rule)();
var constant_expression = (0, typescript_parsec_1.rule)();
exports.declaration = (0, typescript_parsec_1.rule)();
exports.function_prototype = (0, typescript_parsec_1.rule)();
var function_declarator = (0, typescript_parsec_1.rule)();
var function_header_with_parameters = (0, typescript_parsec_1.rule)();
var function_header = (0, typescript_parsec_1.rule)();
exports.parameter_declarator = (0, typescript_parsec_1.rule)();
var parameter_declaration = (0, typescript_parsec_1.rule)();
var parameter_qualifier = (0, typescript_parsec_1.rule)();
var parameter_type_specifier = (0, typescript_parsec_1.rule)();
exports.init_declarator_list = (0, typescript_parsec_1.rule)();
var single_declaration = (0, typescript_parsec_1.rule)();
exports.fully_specified_type = (0, typescript_parsec_1.rule)();
var invariant_qualifier = (0, typescript_parsec_1.rule)();
var interpolation_qualifier = (0, typescript_parsec_1.rule)();
exports.layout_qualifier = (0, typescript_parsec_1.rule)();
var layout_qualifier_id_list = (0, typescript_parsec_1.rule)();
exports.layout_qualifier_id = (0, typescript_parsec_1.rule)();
var parameter_type_qualifier = (0, typescript_parsec_1.rule)();
var type_qualifier = (0, typescript_parsec_1.rule)();
var storage_qualifier = (0, typescript_parsec_1.rule)();
var type_specifier = (0, typescript_parsec_1.rule)();
var type_specifier_no_prec = (0, typescript_parsec_1.rule)();
var type_specifier_nonarray = (0, typescript_parsec_1.rule)();
var precision_qualifier = (0, typescript_parsec_1.rule)();
var struct_specifier = (0, typescript_parsec_1.rule)();
var struct_declaration_list = (0, typescript_parsec_1.rule)();
var struct_declaration = (0, typescript_parsec_1.rule)();
var struct_declarator_list = (0, typescript_parsec_1.rule)();
var struct_declarator = (0, typescript_parsec_1.rule)();
var initializer = (0, typescript_parsec_1.rule)();
var declaration_statement = (0, typescript_parsec_1.rule)();
exports.statement = (0, typescript_parsec_1.rule)();
var statement_no_new_scope = (0, typescript_parsec_1.rule)();
var statement_with_scope = (0, typescript_parsec_1.rule)();
var simple_statement = (0, typescript_parsec_1.rule)();
var compound_statement_with_scope = (0, typescript_parsec_1.rule)();
var compound_statement_no_new_scope = (0, typescript_parsec_1.rule)();
var statement_list = (0, typescript_parsec_1.rule)();
var expression_statement = (0, typescript_parsec_1.rule)();
var selection_statement = (0, typescript_parsec_1.rule)();
var selection_rest_statement = (0, typescript_parsec_1.rule)();
var condition = (0, typescript_parsec_1.rule)();
var switch_statement = (0, typescript_parsec_1.rule)();
var switch_statement_list = (0, typescript_parsec_1.rule)();
var case_label = (0, typescript_parsec_1.rule)();
var iteration_statement = (0, typescript_parsec_1.rule)();
var for_init_statement = (0, typescript_parsec_1.rule)();
var conditionopt = (0, typescript_parsec_1.rule)();
var for_rest_statement = (0, typescript_parsec_1.rule)();
var jump_statement = (0, typescript_parsec_1.rule)();
exports.translation_unit = (0, typescript_parsec_1.rule)();
exports.external_declaration = (0, typescript_parsec_1.rule)();
var function_definition = (0, typescript_parsec_1.rule)();
var placeholder = (0, interleave_comments_1.nodeify)((0, typescript_parsec_1.apply)((0, typescript_parsec_1.nil)(), function () { return ({
    type: "error",
    why: "Placeholder encountered during parsing!",
}); }));
variable_identifier.setPattern((0, interleave_comments_1.nodeify)((0, typescript_parsec_1.apply)((0, typescript_parsec_1.tok)(lexer_1.TokenKind.Identifier), function (s) { return ({
    type: "ident",
    ident: s.text,
    _isExpr: true,
}); })));
exports.primary_expression.setPattern((0, typescript_parsec_1.alt_sc)(
// identifier
variable_identifier, (0, interleave_comments_1.nodeify)((0, typescript_parsec_1.alt_sc)(
// integer literals
(0, typescript_parsec_1.apply)((0, typescript_parsec_1.alt_sc)((0, typescript_parsec_1.tok)(lexer_1.TokenKind.IntegerDecimal), (0, typescript_parsec_1.tok)(lexer_1.TokenKind.IntegerOctal), (0, typescript_parsec_1.tok)(lexer_1.TokenKind.IntegerHex)), function (tok) {
    var num = tok.text[0] == "0" ? parseInt(tok.text, 8) : parseInt(tok.text);
    return {
        type: "int",
        int: num,
        asString: tok.text,
        unsigned: tok.text.endsWith("u") || tok.text.endsWith("U"),
        _isExpr: true,
    };
}), 
// float literal
(0, typescript_parsec_1.apply)((0, typescript_parsec_1.tok)(lexer_1.TokenKind.Float), function (float) { return ({
    type: "float",
    float: parseFloat(float.text),
    asString: float.text,
    _isExpr: true,
}); }), 
// boolean literal
(0, typescript_parsec_1.apply)((0, typescript_parsec_1.alt_sc)((0, typescript_parsec_1.str)("true"), (0, typescript_parsec_1.str)("false")), function (bool) { return ({
    type: "bool",
    bool: bool.text == "true",
    _isExpr: true,
}); }))), 
// parenthesized expression
(0, useful_combinators_1.errExprFallback)((0, interleave_comments_1.add_comments)((0, typescript_parsec_1.seq)(interleave_comments_1.comment_parser, (0, typescript_parsec_1.str)("("), exports.expression, interleave_comments_1.comment_parser, (0, typescript_parsec_1.str)(")")), function (t) { return t[2]; }, function (c, oc) { return __spreadArray(__spreadArray([c[0]], oc, true), [c[3]], false); }), "Syntax error.", (0, useful_combinators_1.consumeUntil)((0, typescript_parsec_1.str)(")")))));
// const field_access: Parser<TokenKind, ASTNode<Expr>> =
//   // a.b
//   binop_generic(
//     alt_sc(function_call_generic, failOnErrExpr(primary_expression)),
//     apply(
//       seq(
//         comment_parser,
//         str("."),
//         comment_parser,
//         alt_sc(
//           apply(function_call_generic, (f) => ({
//             type: "function" as "function",
//             function: f,
//           })),
//           apply(
//             with_comment_before(
//               apply(tok(TokenKind.Identifier), (t) => t.text)
//             ),
//             (t) => ({
//               type: "variable" as "variable",
//               variable: t,
//             })
//           )
//         )
//       ),
//       (s) => s[3]
//     ),
//     (left: ASTNode<Expr>, right) => [
//       {
//         type: "field-access",
//         left,
//         right: right,
//         _isExpr: true,
//       },
//       [],
//     ]
//   );
// postfix_expression.setPattern(
//   alt_sc(
//     // a[b]
//     binop_generic(
//       failOnErrExpr(primary_expression),
//       seq(
//         comment_parser,
//         str("["),
//         integer_expression,
//         comment_parser,
//         str("]")
//       ),
//       (left, right) => [
//         {
//           left,
//           right: right[2],
//           type: "binary-op",
//           op: "[]",
//           _isExpr: true,
//         },
//         [right[0], right[3]],
//       ]
//     ),
//     // a++, a--
//     binop_generic(
//       failOnErrExpr(primary_expression),
//       seq(comment_parser, alt_sc(str("++"), str("--"))),
//       (left, right) => [
//         {
//           type: "unary-op",
//           left,
//           op: right[1].text as "++" | "--",
//           isAfter: true,
//           _isExpr: true,
//         },
//         [right[0]],
//       ]
//     ),
//     field_access,
//     function_call_generic,
//     failOnErrExpr(primary_expression)
//   )
// );
exports.postfix_expression.setPattern((0, typescript_parsec_1.lrec_sc)((0, typescript_parsec_1.alt_sc)(exports.function_call_generic, (0, useful_combinators_1.failOnErrExpr)(exports.primary_expression)), (0, interleave_comments_1.nodeify)((0, typescript_parsec_1.alt_sc)((0, typescript_parsec_1.apply)((0, typescript_parsec_1.seq)(interleave_comments_1.comment_parser, (0, typescript_parsec_1.str)("["), exports.integer_expression, interleave_comments_1.comment_parser, (0, typescript_parsec_1.str)("]")), function (a) { return ({ type: "array", data: a }); }), (0, typescript_parsec_1.apply)((0, typescript_parsec_1.seq)(interleave_comments_1.comment_parser, (0, typescript_parsec_1.alt_sc)((0, typescript_parsec_1.str)("++"), (0, typescript_parsec_1.str)("--"))), function (a) { return ({ type: "incdec", data: a }); }), (0, typescript_parsec_1.apply)((0, typescript_parsec_1.seq)(interleave_comments_1.comment_parser, (0, typescript_parsec_1.str)("."), interleave_comments_1.comment_parser, (0, typescript_parsec_1.alt_sc)((0, typescript_parsec_1.apply)(exports.function_call_generic, function (f) { return ({
    type: "function",
    function: f,
}); }), (0, typescript_parsec_1.apply)((0, interleave_comments_1.with_comment_before)((0, typescript_parsec_1.apply)((0, typescript_parsec_1.tok)(lexer_1.TokenKind.Identifier), function (t) { return t.text; })), function (t) { return ({
    type: "variable",
    variable: t,
}); }))), function (a) { return ({ type: "member", data: a }); }))), function (a, b) {
    var left = a;
    if (b.data.type === "array") {
        return {
            range: b.range,
            _isNode: true,
            data: {
                left: left,
                right: b.data.data[2],
                type: "binary-op",
                op: "[]",
                _isExpr: true,
            },
            comments: [b.data.data[0], b.data.data[3]],
        };
    }
    else if (b.data.type === "incdec") {
        return {
            range: b.range,
            _isNode: true,
            data: {
                left: left,
                type: "unary-op",
                op: b.data.data[1].text,
                isAfter: true,
                _isExpr: true,
            },
            comments: [b.data.data[0]],
        };
    }
    else {
        return {
            range: b.range,
            _isNode: true,
            data: {
                type: "field-access",
                left: left,
                right: b.data.data[3],
                _isExpr: true,
            },
            comments: [b.data.data[0], b.data.data[2]],
        };
    }
}));
exports.integer_expression.setPattern(exports.expression);
exports.function_call.setPattern(function_call_or_method);
function_call_or_method.setPattern(
// NOTE: THIS DIFFERS FROM THE GRAMMAR!!
// METHOD CALLS HAVE BEEN MOVED TO postfix_expression
// TO PREVENT IT FROM DEFAULTING TO PROPERTY ACCESS
// alt_sc(
exports.function_call_generic
// binop_generic(
//   postfix_expression,
//   seq(comment_parser, str("."), function_call_generic),
//   (left, right) => [
//     {
//       type: "function-call-field-access",
//       left,
//       right: right[2],
//       _isExpr: true,
//     },
//     [right[0]],
//   ]
// )
// )
);
exports.function_call_generic.setPattern((0, interleave_comments_1.nodeify_commented)((0, interleave_comments_1.append_comments)((0, typescript_parsec_1.seq)((0, typescript_parsec_1.alt_sc)(exports.function_call_header_with_parameters, exports.function_call_header_no_parameters), interleave_comments_1.comment_parser, (0, typescript_parsec_1.str)(")")), function (s) { return s[0]; }, function (s) { return [s[1]]; })));
exports.function_call_header_no_parameters.setPattern((0, interleave_comments_1.add_comments_and_transform)((0, typescript_parsec_1.seq)(exports.function_call_header, (0, typescript_parsec_1.opt_sc)((0, typescript_parsec_1.seq)(interleave_comments_1.comment_parser, (0, typescript_parsec_1.str)("void")))), function (s) { return s[0]; }, function (i, s) { return ({
    type: "function-call",
    identifier: i,
    isVoid: s[1] !== undefined,
    args: [],
    _isExpr: true,
}); }, function (o, s) { var _a, _b; return __spreadArray(__spreadArray([], o, true), [(_b = (_a = s[1]) === null || _a === void 0 ? void 0 : _a[0]) !== null && _b !== void 0 ? _b : []], false); }));
exports.function_call_header_with_parameters.setPattern((0, interleave_comments_1.add_comments_and_transform)((0, typescript_parsec_1.seq)(exports.function_call_header, exports.assignment_expression, (0, typescript_parsec_1.rep_sc)((0, typescript_parsec_1.seq)(interleave_comments_1.comment_parser, (0, typescript_parsec_1.str)(","), exports.assignment_expression))), function (s) { return s[0]; }, function (i, s) { return ({
    type: "function-call",
    identifier: i,
    isVoid: false,
    args: __spreadArray([s[1]], s[2].map(function (e) { return e[2]; }), true),
    _isExpr: true,
}); }, function (o, s) { return __spreadArray(__spreadArray([], o, true), s[2].map(function (e) { return e[0]; }), true); }));
exports.function_call_header.setPattern((0, interleave_comments_1.append_comments)((0, typescript_parsec_1.seq)(function_identifier, interleave_comments_1.comment_parser, (0, typescript_parsec_1.str)("(")), function (s) { return s[0]; }, function (s) { return [s[1]]; }));
function_identifier.setPattern((0, typescript_parsec_1.alt_sc)(type_specifier, (0, interleave_comments_1.with_comment_before)((0, typescript_parsec_1.apply)((0, typescript_parsec_1.tok)(lexer_1.TokenKind.Identifier), function (s) { return ({
    type: "function-identifier",
    identifier: s.text,
}); }))));
exports.unary_expression.setPattern((0, typescript_parsec_1.alt_sc)(exports.postfix_expression, (0, interleave_comments_1.nodeify)((0, typescript_parsec_1.apply)((0, typescript_parsec_1.seq)((0, typescript_parsec_1.alt_sc)((0, typescript_parsec_1.str)("--"), (0, typescript_parsec_1.str)("++"), (0, typescript_parsec_1.str)("+"), (0, typescript_parsec_1.str)("-"), (0, typescript_parsec_1.str)("!"), (0, typescript_parsec_1.str)("~")), exports.unary_expression), function (_a) {
    var expr = _a[0], left = _a[1];
    return ({
        type: "unary-op",
        op: expr.text,
        left: left,
        isAfter: false,
        _isExpr: true,
    });
}))));
exports.multiplicative_expression.setPattern((0, interleave_comments_1.binop)(exports.unary_expression, exports.multiplicative_expression, (0, typescript_parsec_1.alt_sc)((0, useful_combinators_1.lstr)("*"), (0, useful_combinators_1.lstr)("/"), (0, useful_combinators_1.lstr)("%"))));
additive_expression.setPattern((0, interleave_comments_1.binop)(exports.multiplicative_expression, additive_expression, (0, typescript_parsec_1.alt_sc)((0, useful_combinators_1.lstr)("+"), (0, useful_combinators_1.lstr)("-"))));
shift_expression.setPattern((0, interleave_comments_1.binop)(additive_expression, shift_expression, (0, typescript_parsec_1.alt_sc)((0, useful_combinators_1.lstr)(">>"), (0, useful_combinators_1.lstr)("<<"))));
relational_expression.setPattern((0, interleave_comments_1.binop)(shift_expression, relational_expression, (0, typescript_parsec_1.alt_sc)((0, useful_combinators_1.lstr)(">"), (0, useful_combinators_1.lstr)("<"), (0, useful_combinators_1.lstr)(">="), (0, useful_combinators_1.lstr)("<="))));
equality_expression.setPattern((0, interleave_comments_1.binop)(relational_expression, equality_expression, (0, typescript_parsec_1.alt_sc)((0, useful_combinators_1.lstr)("=="), (0, useful_combinators_1.lstr)("!="))));
exports.and_expression.setPattern((0, interleave_comments_1.binop)(equality_expression, exports.and_expression, (0, useful_combinators_1.lstr)("&")));
exclusive_or_expression.setPattern((0, interleave_comments_1.binop)(exports.and_expression, exclusive_or_expression, (0, useful_combinators_1.lstr)("^")));
inclusive_or_expression.setPattern((0, interleave_comments_1.binop)(exclusive_or_expression, inclusive_or_expression, (0, useful_combinators_1.lstr)("|")));
logical_and_expression.setPattern((0, interleave_comments_1.binop)(inclusive_or_expression, logical_and_expression, (0, useful_combinators_1.lstr)("&&")));
logical_xor_expression.setPattern((0, interleave_comments_1.binop)(logical_and_expression, logical_xor_expression, (0, useful_combinators_1.lstr)("^^")));
exports.logical_or_expression.setPattern((0, interleave_comments_1.binop)(logical_xor_expression, exports.logical_or_expression, (0, useful_combinators_1.lstr)("||")));
conditional_expression.setPattern((0, typescript_parsec_1.alt_sc)((0, interleave_comments_1.nodeify_commented)((0, interleave_comments_1.commentify)((0, typescript_parsec_1.seq)(exports.logical_or_expression, interleave_comments_1.comment_parser, (0, typescript_parsec_1.str)("?"), exports.expression, interleave_comments_1.comment_parser, (0, typescript_parsec_1.str)(":"), exports.assignment_expression), function (l) { return ({
    type: "conditional",
    condition: l[0],
    ifTrue: l[3],
    ifFalse: l[6],
    _isExpr: true,
}); }, function (l) { return [l[1], l[4]]; })), exports.logical_or_expression));
exports.assignment_expression.setPattern((0, typescript_parsec_1.alt_sc)((0, interleave_comments_1.nodeify_commented)((0, interleave_comments_1.commentify)((0, typescript_parsec_1.seq)(exports.unary_expression, interleave_comments_1.comment_parser, assignment_operator, exports.assignment_expression), function (l) { return ({
    type: "assignment",
    left: l[0],
    right: l[3],
    op: l[2],
    _isExpr: true,
}); }, function (l) { return [l[1]]; })), conditional_expression));
assignment_operator.setPattern((0, typescript_parsec_1.alt_sc)((0, useful_combinators_1.lstr)("="), (0, useful_combinators_1.lstr)("*="), (0, useful_combinators_1.lstr)("/="), (0, useful_combinators_1.lstr)("%="), (0, useful_combinators_1.lstr)("+="), (0, useful_combinators_1.lstr)("-="), (0, useful_combinators_1.lstr)("<<="), (0, useful_combinators_1.lstr)(">>="), (0, useful_combinators_1.lstr)("&="), (0, useful_combinators_1.lstr)("^="), (0, useful_combinators_1.lstr)("|=")));
exports.expression.setPattern((0, interleave_comments_1.binop)(exports.assignment_expression, exports.expression, (0, useful_combinators_1.lstr)(",")));
constant_expression.setPattern(conditional_expression);
exports.declaration.setPattern((0, interleave_comments_1.nodeify_commented)((0, typescript_parsec_1.alt_sc)((0, interleave_comments_1.commentify)((0, typescript_parsec_1.seq)(exports.init_declarator_list, interleave_comments_1.comment_parser, (0, typescript_parsec_1.str)(";")), function (s) {
    return ({
        type: "declarator-list",
        declaratorList: s[0],
        _isDecl: true,
    });
}, function (s) { return [s[1]]; }), (0, interleave_comments_1.commentify)((0, typescript_parsec_1.seq)((0, typescript_parsec_1.apply)(type_qualifier, function (x) { return x; }), (0, interleave_comments_1.with_comment_before)((0, typescript_parsec_1.apply)((0, typescript_parsec_1.tok)(lexer_1.TokenKind.Identifier), function (t) { return t.text; })), interleave_comments_1.comment_parser, (0, typescript_parsec_1.str)("{"), struct_declaration_list, interleave_comments_1.comment_parser, (0, typescript_parsec_1.str)("}"), (0, typescript_parsec_1.opt_sc)((0, typescript_parsec_1.seq)((0, interleave_comments_1.with_comment_before)((0, typescript_parsec_1.apply)((0, typescript_parsec_1.tok)(lexer_1.TokenKind.Identifier), function (t) { return t.text; })), (0, typescript_parsec_1.opt_sc)((0, typescript_parsec_1.seq)(interleave_comments_1.comment_parser, (0, typescript_parsec_1.str)("["), constant_expression, interleave_comments_1.comment_parser, (0, typescript_parsec_1.str)("]"))))), interleave_comments_1.comment_parser, (0, typescript_parsec_1.str)(";")), function (s) {
    var _a, _b, _c;
    return ({
        type: "struct",
        typeQualifier: s[0],
        name: s[1],
        name2: (_a = s[7]) === null || _a === void 0 ? void 0 : _a[0],
        declarationList: s[4],
        constantExpr: (_c = (_b = s[7]) === null || _b === void 0 ? void 0 : _b[1]) === null || _c === void 0 ? void 0 : _c[2],
        _isDecl: true,
    });
}, function (s) {
    var _a;
    return __spreadArray(__spreadArray([
        s[2],
        s[5]
    ], (((_a = s[7]) === null || _a === void 0 ? void 0 : _a[1]) ? [s[7][1][0], s[7][1][3]] : []), true), [
        s[8],
    ], false);
}), (0, interleave_comments_1.commentify)((0, typescript_parsec_1.seq)(exports.function_prototype, interleave_comments_1.comment_parser, (0, typescript_parsec_1.str)(";")), function (s) { return ({ type: "function-prototype", prototype: s[0], _isDecl: true }); }, function (s) { return [s[1]]; }), (0, interleave_comments_1.commentify)((0, typescript_parsec_1.seq)((0, typescript_parsec_1.str)("precision"), precision_qualifier, type_specifier_no_prec, interleave_comments_1.comment_parser, (0, typescript_parsec_1.str)(";")), function (s) {
    return ({
        type: "type-specifier",
        precision: s[1],
        specifier: s[2],
        _isDecl: true,
    });
}, function (s) { return [s[3]]; }), (0, interleave_comments_1.commentify)((0, typescript_parsec_1.seq)(type_qualifier, interleave_comments_1.comment_parser, (0, typescript_parsec_1.str)(";")), function (s) { return ({
    type: "type-qualifier",
    typeQualifier: s[0],
    _isDecl: true,
}); }, function (s) { return [s[1]]; }))));
exports.function_prototype.setPattern((0, interleave_comments_1.add_comments_and_transform)((0, typescript_parsec_1.seq)(function_declarator, interleave_comments_1.comment_parser, (0, typescript_parsec_1.str)(")")), function (s) { return s[0]; }, function (v) { return v; }, function (oc, s) { return __spreadArray(__spreadArray([], oc, true), [s[1]], false); }));
function_declarator.setPattern((0, typescript_parsec_1.alt_sc)(function_header_with_parameters, function_header));
function_header_with_parameters.setPattern((0, interleave_comments_1.add_comments_and_transform)((0, typescript_parsec_1.seq)(function_header, (0, interleave_comments_1.commentify)((0, typescript_parsec_1.seq)(parameter_declaration, (0, typescript_parsec_1.rep_sc)((0, typescript_parsec_1.seq)(interleave_comments_1.comment_parser, (0, typescript_parsec_1.str)(","), parameter_declaration))), function (s) {
    return __spreadArray([s[0]], s[1].map(function (v) { return v[2]; }), true);
}, function (s) { return s[1].map(function (v) { return v[0]; }); })), function (s) { return s[0]; }, function (fh, s) { return (__assign(__assign({}, fh), { parameters: s[1] })); }, function (oc) { return oc; }));
function_header.setPattern((0, interleave_comments_1.commentify)((0, typescript_parsec_1.seq)(exports.fully_specified_type, (0, interleave_comments_1.with_comment_before)((0, typescript_parsec_1.apply)((0, typescript_parsec_1.tok)(lexer_1.TokenKind.Identifier), function (t) { return t.text; })), interleave_comments_1.comment_parser, (0, typescript_parsec_1.str)("(")), function (s) {
    return ({
        fullySpecifiedType: s[0],
        name: s[1],
    });
}, function (s) { return [s[2]]; }));
exports.parameter_declarator.setPattern((0, interleave_comments_1.commentify)((0, typescript_parsec_1.seq)(type_specifier, (0, interleave_comments_1.with_comment_before)((0, typescript_parsec_1.apply)((0, typescript_parsec_1.tok)(lexer_1.TokenKind.Identifier), function (t) { return t.text; })), (0, typescript_parsec_1.opt_sc)((0, typescript_parsec_1.seq)((0, typescript_parsec_1.str)("["), constant_expression, interleave_comments_1.comment_parser, (0, typescript_parsec_1.str)("]")))), function (s) {
    var _a;
    return ({
        typeSpecifier: s[0],
        identifier: s[1],
        arraySize: (_a = s[2]) === null || _a === void 0 ? void 0 : _a[1],
    });
}, function (s) { var _a, _b; return [(_b = (_a = s[2]) === null || _a === void 0 ? void 0 : _a[2]) !== null && _b !== void 0 ? _b : []]; }));
parameter_declaration.setPattern((0, interleave_comments_1.nodeify_commented)((0, interleave_comments_1.with_comment_before)((0, typescript_parsec_1.apply)((0, typescript_parsec_1.seq)((0, typescript_parsec_1.opt_sc)(parameter_type_qualifier), parameter_qualifier, (0, typescript_parsec_1.alt_sc)((0, typescript_parsec_1.apply)(exports.parameter_declarator, function (pd) { return ({
    type: "declarator",
    declarator: pd,
}); }), (0, typescript_parsec_1.apply)(parameter_type_specifier, function (pts) { return ({
    type: "specifier",
    specifier: pts,
}); }))), function (_a) {
    var ptq = _a[0], pq = _a[1], dos = _a[2];
    return ({
        parameterTypeQualifier: ptq,
        parameterQualifier: pq,
        declaratorOrSpecifier: dos,
    });
}))));
parameter_qualifier.setPattern((0, typescript_parsec_1.alt_sc)((0, interleave_comments_1.nodeify)((0, typescript_parsec_1.alt_sc)((0, useful_combinators_1.lstr)("in"), (0, useful_combinators_1.lstr)("out"), (0, useful_combinators_1.lstr)("inout"))), (0, typescript_parsec_1.nil)()));
parameter_type_specifier.setPattern(type_specifier);
// custom rule for convenience
var identifier_declaration = (0, interleave_comments_1.commentify)((0, typescript_parsec_1.seq)((0, interleave_comments_1.with_comment_before)((0, typescript_parsec_1.apply)((0, typescript_parsec_1.tok)(lexer_1.TokenKind.Identifier), function (t) { return t.text; })), (0, typescript_parsec_1.alt_sc)((0, interleave_comments_1.commentify)((0, typescript_parsec_1.seq)((0, typescript_parsec_1.str)("["), (0, typescript_parsec_1.opt_sc)(constant_expression), interleave_comments_1.comment_parser, (0, typescript_parsec_1.str)("]"), interleave_comments_1.comment_parser, (0, typescript_parsec_1.str)("="), initializer), function (s) {
    return ({
        type: "initialized-array",
        size: s[1],
        initializer: s[6],
    });
}, function (s) { return [s[2], s[4]]; }), (0, interleave_comments_1.commentify)((0, typescript_parsec_1.seq)((0, typescript_parsec_1.str)("["), constant_expression, interleave_comments_1.comment_parser, (0, typescript_parsec_1.str)("]")), function (s) {
    return ({
        type: "sized-array",
        size: s[1],
    });
}, function (s) { return [s[2]]; }), (0, interleave_comments_1.commentify)((0, typescript_parsec_1.seq)(interleave_comments_1.comment_parser, (0, typescript_parsec_1.str)("="), initializer), function (s) {
    return ({
        type: "initialized",
        initializer: s[2],
    });
}, function (s) { return [s[0]]; }), (0, typescript_parsec_1.nil)())), function (s) { return ({
    name: s[0],
    variant: s[1],
}); }, function (s) { return []; });
exports.init_declarator_list.setPattern((0, interleave_comments_1.with_comment_before)((0, typescript_parsec_1.apply)((0, typescript_parsec_1.seq)((0, typescript_parsec_1.alt_sc)((0, interleave_comments_1.with_comment_before)((0, typescript_parsec_1.apply)(exports.fully_specified_type, function (s) {
    return ({
        type: "type",
        declType: s,
    });
})), (0, interleave_comments_1.with_comment_before)((0, typescript_parsec_1.apply)((0, typescript_parsec_1.str)("invariant"), function (s) { return ({ type: "invariant" }); }))), (0, interleave_comments_1.commentify)((0, typescript_parsec_1.opt_sc)((0, typescript_parsec_1.seq)(identifier_declaration, (0, typescript_parsec_1.rep_sc)((0, typescript_parsec_1.seq)(interleave_comments_1.comment_parser, (0, typescript_parsec_1.str)(","), identifier_declaration)))), function (s) { return (s ? __spreadArray([s[0]], s[1].map(function (e) { return e[2]; }), true) : []); }, function (s) { return (s ? s[1].map(function (e) { return e[0]; }) : []); })), function (s) { return ({
    init: s[0],
    declarations: s[1],
}); })));
// not even implementing this one tbh
// no need lol
single_declaration;
exports.fully_specified_type.setPattern((0, interleave_comments_1.with_comment_before)((0, typescript_parsec_1.apply)((0, typescript_parsec_1.seq)((0, typescript_parsec_1.opt_sc)(type_qualifier), type_specifier), function (_a) {
    var qualifier = _a[0], specifier = _a[1];
    return ({
        specifier: specifier,
        qualifier: qualifier,
    });
})));
invariant_qualifier.setPattern((0, interleave_comments_1.with_comment_before)((0, useful_combinators_1.lstr)("invariant")));
interpolation_qualifier.setPattern((0, interleave_comments_1.with_comment_before)((0, typescript_parsec_1.alt_sc)((0, useful_combinators_1.lstr)("smooth"), (0, useful_combinators_1.lstr)("flat"))));
exports.layout_qualifier.setPattern((0, interleave_comments_1.add_comments_and_transform)((0, typescript_parsec_1.seq)((0, typescript_parsec_1.str)("layout"), interleave_comments_1.comment_parser, (0, typescript_parsec_1.str)("("), layout_qualifier_id_list, interleave_comments_1.comment_parser, (0, typescript_parsec_1.str)(")")), function (s) { return s[3]; }, function (d, s) { return d; }, function (o, s) { return __spreadArray(__spreadArray([s[1]], o, true), [s[4]], false); }));
layout_qualifier_id_list.setPattern((0, interleave_comments_1.commentify)((0, typescript_parsec_1.seq)(exports.layout_qualifier_id, (0, typescript_parsec_1.rep_sc)((0, typescript_parsec_1.seq)(interleave_comments_1.comment_parser, (0, useful_combinators_1.lstr)(","), exports.layout_qualifier_id))), function (s) { return __spreadArray([s[0]], s[1].map(function (e) { return e[2]; }), true); }, function (s) { return s[1].map(function (e) { return e[0]; }); }));
exports.layout_qualifier_id.setPattern((0, typescript_parsec_1.alt_sc)((0, interleave_comments_1.commentify)((0, typescript_parsec_1.seq)((0, typescript_parsec_1.tok)(lexer_1.TokenKind.Identifier), interleave_comments_1.comment_parser, (0, typescript_parsec_1.str)("="), interleave_comments_1.comment_parser, (0, typescript_parsec_1.alt_sc)((0, typescript_parsec_1.tok)(lexer_1.TokenKind.IntegerDecimal), (0, typescript_parsec_1.tok)(lexer_1.TokenKind.IntegerHex), (0, typescript_parsec_1.tok)(lexer_1.TokenKind.IntegerOctal))), function (s) { return ({
    identifier: s[0].text,
    value: glslParseInt(s[4].text),
}); }, function (s) { return [s[1], s[3]]; }), (0, interleave_comments_1.with_comment_before)((0, typescript_parsec_1.apply)((0, typescript_parsec_1.alt_sc)((0, typescript_parsec_1.tok)(lexer_1.TokenKind.Identifier), (0, typescript_parsec_1.tok)(lexer_1.TokenKind.Keyword)), function (i) { return ({
    identifier: i.text,
}); }))));
parameter_type_qualifier.setPattern((0, interleave_comments_1.with_comment_before)((0, useful_combinators_1.lstr)("const")));
type_qualifier.setPattern((0, typescript_parsec_1.alt_sc)(
// storage_qualifier
(0, interleave_comments_1.with_comment_before)((0, typescript_parsec_1.apply)(storage_qualifier, function (q) { return ({
    type: "sq",
    storageQualifier: q,
}); })), 
// layout_qualifier
// layout_qualifier storage_qualifier
(0, interleave_comments_1.with_comment_before)((0, typescript_parsec_1.apply)((0, typescript_parsec_1.seq)(exports.layout_qualifier, (0, typescript_parsec_1.opt_sc)(storage_qualifier)), function (_a) {
    var lq = _a[0], sq = _a[1];
    return ({
        type: "lq-sq",
        layoutQualifier: lq,
        storageQualifier: sq,
    });
})), 
// interpolation_qualifier storage_qualifier
// interpolation_qualifier
(0, interleave_comments_1.with_comment_before)((0, typescript_parsec_1.apply)((0, typescript_parsec_1.seq)(interpolation_qualifier, (0, typescript_parsec_1.opt_sc)(storage_qualifier)), function (_a) {
    var iq = _a[0], sq = _a[1];
    return ({
        type: "intq-sq",
        interpolationQualifier: iq,
        storageQualifier: sq,
    });
})), 
// invariant_qualifier storage_qualifier
// invariant_qualifier interpolation_qualifier storage_qualifier
(0, interleave_comments_1.with_comment_before)((0, typescript_parsec_1.apply)((0, typescript_parsec_1.seq)(invariant_qualifier, (0, typescript_parsec_1.opt_sc)(interpolation_qualifier), storage_qualifier), function (_a) {
    var invq = _a[0], intq = _a[1], sq = _a[2];
    return ({
        type: "invq-intq-sq",
        interpolationQualifier: intq,
        invariantQualifier: invq,
        storageQualifier: sq,
    });
}))));
storage_qualifier.setPattern((0, interleave_comments_1.with_comment_before)((0, typescript_parsec_1.alt_sc)((0, useful_combinators_1.lstr)("const"), (0, useful_combinators_1.lstr)("in"), (0, useful_combinators_1.lstr)("out"), (0, typescript_parsec_1.apply)((0, typescript_parsec_1.seq)((0, typescript_parsec_1.str)("centroid"), (0, typescript_parsec_1.str)("in")), function () { return "centroid in"; }), (0, typescript_parsec_1.apply)((0, typescript_parsec_1.seq)((0, typescript_parsec_1.str)("centroid"), (0, typescript_parsec_1.str)("out")), function () { return "centroid out"; }), (0, useful_combinators_1.lstr)("uniform"))));
type_specifier.setPattern((0, interleave_comments_1.nodeify_commented)((0, interleave_comments_1.commentify)((0, typescript_parsec_1.seq)((0, typescript_parsec_1.opt_sc)(precision_qualifier), type_specifier_no_prec), function (_a) {
    var precision = _a[0], specifier = _a[1];
    return ({
        type: "type-specifier",
        specifier: specifier,
        precision: precision,
    });
}, function (s) { return []; })));
type_specifier_no_prec.setPattern((0, interleave_comments_1.commentify)((0, typescript_parsec_1.seq)(type_specifier_nonarray, (0, typescript_parsec_1.opt_sc)((0, typescript_parsec_1.seq)(interleave_comments_1.comment_parser, (0, typescript_parsec_1.seq)((0, typescript_parsec_1.str)("["), (0, typescript_parsec_1.opt_sc)(constant_expression), interleave_comments_1.comment_parser, (0, typescript_parsec_1.str)("]"))))), function (s) {
    return ({
        typeName: s[0],
        arrayType: s[1]
            ? s[1][1][1]
                ? { type: "static", size: s[1][1][1] }
                : { type: "dynamic" }
            : { type: "none" },
    });
}, function (s) { return (s[1] ? [s[1][0], s[1][1][2]] : []); }));
type_specifier_nonarray.setPattern((0, interleave_comments_1.with_comment_before)((0, typescript_parsec_1.alt_sc)((0, typescript_parsec_1.apply)((0, interleave_comments_1.with_comment_before)((0, typescript_parsec_1.alt_sc)((0, typescript_parsec_1.alt_sc)((0, useful_combinators_1.lstr)("void"), (0, useful_combinators_1.lstr)("float"), (0, useful_combinators_1.lstr)("int"), (0, useful_combinators_1.lstr)("uint"), (0, useful_combinators_1.lstr)("bool"), (0, useful_combinators_1.lstr)("vec2"), (0, useful_combinators_1.lstr)("vec3"), (0, useful_combinators_1.lstr)("vec4"), (0, useful_combinators_1.lstr)("bvec2"), (0, useful_combinators_1.lstr)("bvec3"), (0, useful_combinators_1.lstr)("bvec4"), (0, useful_combinators_1.lstr)("ivec2"), (0, useful_combinators_1.lstr)("ivec3"), (0, useful_combinators_1.lstr)("ivec4"), (0, useful_combinators_1.lstr)("uvec2"), (0, useful_combinators_1.lstr)("uvec3")), (0, typescript_parsec_1.alt_sc)((0, useful_combinators_1.lstr)("uvec4"), (0, useful_combinators_1.lstr)("mat2"), (0, useful_combinators_1.lstr)("mat3"), (0, useful_combinators_1.lstr)("mat4"), (0, useful_combinators_1.lstr)("mat3x2"), (0, useful_combinators_1.lstr)("mat3x3"), (0, useful_combinators_1.lstr)("mat3x4"), (0, useful_combinators_1.lstr)("mat4x2"), (0, useful_combinators_1.lstr)("mat4x3"), (0, useful_combinators_1.lstr)("mat4x4")), (0, typescript_parsec_1.alt_sc)((0, useful_combinators_1.lstr)("sampler2D"), (0, useful_combinators_1.lstr)("sampler3D"), (0, useful_combinators_1.lstr)("samplerCube"), (0, useful_combinators_1.lstr)("sampler2DShadow"), (0, useful_combinators_1.lstr)("samplerCubeShadow"), (0, useful_combinators_1.lstr)("sampler2DArray"), (0, useful_combinators_1.lstr)("sampler2DArrayShadow"), (0, useful_combinators_1.lstr)("isampler2D"), (0, useful_combinators_1.lstr)("isampler3D"), (0, useful_combinators_1.lstr)("isamplerCube"), (0, useful_combinators_1.lstr)("isampler2DArray"), (0, useful_combinators_1.lstr)("usampler2D"), (0, useful_combinators_1.lstr)("usampler3D"), (0, useful_combinators_1.lstr)("usamplerCube"), (0, useful_combinators_1.lstr)("usampler2DArray")))), function (s) { return ({
    type: "builtin",
    name: s,
}); }), (0, typescript_parsec_1.apply)(struct_specifier, function (s) { return ({
    type: "struct",
    struct: s,
}); }), (0, typescript_parsec_1.apply)((0, interleave_comments_1.with_comment_before)((0, typescript_parsec_1.apply)((0, typescript_parsec_1.tok)(lexer_1.TokenKind.Identifier), function (s) { return s.text; })), function (s) {
    return ({
        type: "custom",
        name: s,
    });
}))));
precision_qualifier.setPattern((0, interleave_comments_1.with_comment_before)((0, typescript_parsec_1.alt_sc)((0, useful_combinators_1.lstr)("highp"), (0, useful_combinators_1.lstr)("mediump"), (0, useful_combinators_1.lstr)("lowp"))));
struct_specifier.setPattern((0, interleave_comments_1.commentify)((0, typescript_parsec_1.seq)((0, typescript_parsec_1.str)("struct"), (0, typescript_parsec_1.opt_sc)((0, interleave_comments_1.with_comment_before)((0, typescript_parsec_1.apply)((0, typescript_parsec_1.tok)(lexer_1.TokenKind.Identifier), function (t) { return t.text; }))), interleave_comments_1.comment_parser, (0, typescript_parsec_1.str)("{"), struct_declaration_list, interleave_comments_1.comment_parser, (0, typescript_parsec_1.str)("}")), function (s) { return ({
    members: s[4],
    name: s[1],
    _isStruct: true,
}); }, function (s) { return [s[2], s[5]]; }));
struct_declaration_list.setPattern((0, interleave_comments_1.with_comment_before)((0, typescript_parsec_1.rep_sc)(struct_declaration)));
struct_declaration.setPattern((0, interleave_comments_1.commentify)((0, typescript_parsec_1.seq)((0, typescript_parsec_1.opt_sc)(type_qualifier), type_specifier, struct_declarator_list, interleave_comments_1.comment_parser, (0, typescript_parsec_1.str)(";")), function (s) { return ({
    typeQualifier: s[0],
    typeSpecifier: s[1],
    declaratorList: s[2],
}); }, function (s) { return [s[3]]; }));
struct_declarator_list.setPattern((0, interleave_comments_1.commentify)((0, typescript_parsec_1.seq)(struct_declarator, (0, typescript_parsec_1.rep_sc)((0, typescript_parsec_1.seq)(interleave_comments_1.comment_parser, (0, typescript_parsec_1.str)(","), struct_declarator))), function (s) { return __spreadArray([s[0]], s[1].map(function (e) { return e[2]; }), true); }, function (s) { return s[1].map(function (e) { return e[0]; }); }));
struct_declarator.setPattern((0, interleave_comments_1.commentify)((0, typescript_parsec_1.seq)((0, typescript_parsec_1.tok)(lexer_1.TokenKind.Identifier), (0, typescript_parsec_1.opt_sc)((0, typescript_parsec_1.seq)(interleave_comments_1.comment_parser, (0, typescript_parsec_1.str)("["), (0, typescript_parsec_1.opt_sc)(constant_expression), interleave_comments_1.comment_parser, (0, typescript_parsec_1.str)("]")))), function (s) {
    var _a;
    return ({
        name: s[0].text,
        isArray: s[1]
            ? {
                expr: (_a = s[1]) === null || _a === void 0 ? void 0 : _a[2],
            }
            : undefined,
    });
}, function (s) { return (s[1] ? [s[1][0], s[1][3]] : []); }));
initializer.setPattern(exports.assignment_expression);
declaration_statement.setPattern((0, interleave_comments_1.nodeify)((0, typescript_parsec_1.apply)(exports.declaration, function (decl) {
    return ({
        type: "declaration",
        decl: decl,
        _isStmt: true,
    });
})));
exports.statement.setPattern((0, typescript_parsec_1.alt_sc)(compound_statement_with_scope, simple_statement));
statement_no_new_scope.setPattern((0, typescript_parsec_1.alt_sc)(compound_statement_no_new_scope, simple_statement));
statement_with_scope.setPattern((0, typescript_parsec_1.alt_sc)(compound_statement_no_new_scope, simple_statement));
simple_statement.setPattern((0, typescript_parsec_1.alt_sc)(expression_statement, declaration_statement, selection_statement, switch_statement, case_label, iteration_statement, jump_statement));
compound_statement_with_scope.setPattern(compound_statement_no_new_scope);
compound_statement_no_new_scope.setPattern((0, interleave_comments_1.nodeify_commented)((0, interleave_comments_1.commentify)((0, typescript_parsec_1.seq)((0, typescript_parsec_1.str)("{"), (0, typescript_parsec_1.opt_sc)(statement_list), interleave_comments_1.comment_parser, (0, typescript_parsec_1.str)("}")), function (s) { var _a; return ({ type: "compound", statements: (_a = s[1]) !== null && _a !== void 0 ? _a : [], _isStmt: true }); }, function (s) { return [s[2]]; })));
var errorable_statement = (0, useful_combinators_1.fail_if)((0, useful_combinators_1.errStmtFallback)(exports.statement, "Expected a statement.", 
// if we can't find a statement...
(0, useful_combinators_1.consumeUntil)(
// keep consuming until semicolon
(0, typescript_parsec_1.str)(";"), 
// alternatively, keep consuming, but then STOP right before the "}"
(0, typescript_parsec_1.str)("}"))), 
// error state or not, we KNOW a statement REALLY doesn't exist if it's just whitespace/comments
(0, typescript_parsec_1.rep_sc)((0, typescript_parsec_1.alt_sc)((0, typescript_parsec_1.tok)(lexer_1.TokenKind.Whitespace), (0, typescript_parsec_1.tok)(lexer_1.TokenKind.Comment))));
statement_list.setPattern((0, typescript_parsec_1.apply)((0, typescript_parsec_1.seq)(errorable_statement, (0, typescript_parsec_1.rep_sc)(errorable_statement)), function (_a) {
    var stmt1 = _a[0], rest = _a[1];
    return __spreadArray([stmt1], rest, true);
}));
expression_statement.setPattern((0, interleave_comments_1.nodeify_commented)((0, interleave_comments_1.commentify)((0, typescript_parsec_1.seq)((0, typescript_parsec_1.opt_sc)(exports.expression), interleave_comments_1.comment_parser, (0, typescript_parsec_1.str)(";")), function (s) { return ({
    type: "expr",
    expr: s[0],
    _isStmt: true,
}); }, function (s) { return [s[1]]; })));
selection_statement.setPattern((0, interleave_comments_1.nodeify_commented)((0, interleave_comments_1.commentify)((0, typescript_parsec_1.seq)((0, typescript_parsec_1.str)("if"), interleave_comments_1.comment_parser, (0, typescript_parsec_1.str)("("), exports.expression, interleave_comments_1.comment_parser, (0, typescript_parsec_1.str)(")"), selection_rest_statement), function (s) { return ({
    type: "selection",
    cond: s[3],
    rest: s[6],
    _isStmt: true,
}); }, function (s) { return [s[1], s[4]]; })));
selection_rest_statement.setPattern((0, interleave_comments_1.commentify)((0, typescript_parsec_1.seq)(statement_with_scope, (0, typescript_parsec_1.opt_sc)((0, typescript_parsec_1.seq)(interleave_comments_1.comment_parser, (0, typescript_parsec_1.str)("else"), statement_with_scope))), function (s) {
    var _a;
    return ({
        if: s[0],
        else: (_a = s[1]) === null || _a === void 0 ? void 0 : _a[2],
        _isStmt: true,
    });
}, function (s) { return (s[1] ? [s[1][0]] : []); }));
condition.setPattern((0, typescript_parsec_1.alt_sc)((0, interleave_comments_1.with_comment_before)((0, typescript_parsec_1.apply)(exports.expression, function (s) { return ({ type: "expr", expr: s }); })), (0, interleave_comments_1.commentify)((0, typescript_parsec_1.seq)(exports.fully_specified_type, (0, interleave_comments_1.with_comment_before)((0, typescript_parsec_1.apply)((0, typescript_parsec_1.tok)(lexer_1.TokenKind.Identifier), function (t) { return t.text; })), interleave_comments_1.comment_parser, (0, typescript_parsec_1.str)("="), initializer), function (s) {
    return ({
        type: "type-equal-init",
        fullySpecifiedType: s[0],
        name: s[1],
        initializer: s[4],
    });
}, function (s) { return [s[2]]; })));
switch_statement.setPattern((0, interleave_comments_1.nodeify_commented)((0, interleave_comments_1.commentify)((0, typescript_parsec_1.seq)((0, typescript_parsec_1.str)("switch"), interleave_comments_1.comment_parser, (0, typescript_parsec_1.str)("("), exports.expression, interleave_comments_1.comment_parser, (0, typescript_parsec_1.str)(")"), interleave_comments_1.comment_parser, (0, typescript_parsec_1.str)("{"), switch_statement_list, interleave_comments_1.comment_parser, (0, typescript_parsec_1.str)("}")), function (s) {
    var _a;
    return ({
        type: "switch",
        expr: s[3],
        stmts: (_a = s[8]) !== null && _a !== void 0 ? _a : [],
        _isStmt: true,
    });
}, function (s) { return [s[1], s[4], s[6], s[9]]; })));
switch_statement_list.setPattern((0, typescript_parsec_1.opt_sc)(statement_list));
case_label.setPattern((0, interleave_comments_1.nodeify_commented)((0, typescript_parsec_1.alt_sc)((0, interleave_comments_1.commentify)((0, typescript_parsec_1.seq)((0, typescript_parsec_1.str)("case"), exports.expression, interleave_comments_1.comment_parser, (0, typescript_parsec_1.str)(":")), function (s) { return ({ type: "case", expr: s[1], _isStmt: true }); }, function (s) { return [s[2]]; }), (0, interleave_comments_1.commentify)((0, typescript_parsec_1.seq)((0, typescript_parsec_1.str)("default"), interleave_comments_1.comment_parser, (0, typescript_parsec_1.str)(":")), function (s) { return ({ type: "default-case", _isStmt: true }); }, function (s) { return [s[1]]; }))));
iteration_statement.setPattern((0, interleave_comments_1.nodeify_commented)((0, typescript_parsec_1.alt_sc)((0, interleave_comments_1.commentify)((0, typescript_parsec_1.seq)((0, typescript_parsec_1.str)("while"), interleave_comments_1.comment_parser, (0, typescript_parsec_1.str)("("), condition, interleave_comments_1.comment_parser, (0, typescript_parsec_1.str)(")"), statement_no_new_scope), function (s) {
    return ({
        type: "while",
        cond: s[3],
        body: s[6],
        _isStmt: true,
    });
}, function (s) { return [s[1], s[4]]; }), (0, interleave_comments_1.commentify)((0, typescript_parsec_1.seq)((0, typescript_parsec_1.str)("do"), statement_with_scope, interleave_comments_1.comment_parser, (0, typescript_parsec_1.str)("while"), interleave_comments_1.comment_parser, (0, typescript_parsec_1.str)("("), exports.expression, interleave_comments_1.comment_parser, (0, typescript_parsec_1.str)(")"), interleave_comments_1.comment_parser, (0, typescript_parsec_1.str)(";")), function (s) {
    return ({
        type: "do-while",
        cond: s[6],
        body: s[1],
        _isStmt: true,
    });
}, function (s) { return [s[2], s[4], s[7], s[9]]; }), (0, interleave_comments_1.commentify)((0, typescript_parsec_1.seq)((0, typescript_parsec_1.str)("for"), interleave_comments_1.comment_parser, (0, typescript_parsec_1.str)("("), for_init_statement, for_rest_statement, interleave_comments_1.comment_parser, (0, typescript_parsec_1.str)(")"), statement_no_new_scope), function (s) { return ({
    type: "for",
    init: s[3],
    rest: s[4],
    body: s[7],
    _isStmt: true,
}); }, function (s) { return [s[1], s[5]]; }))));
for_init_statement.setPattern((0, typescript_parsec_1.alt_sc)(expression_statement, declaration_statement));
conditionopt.setPattern((0, typescript_parsec_1.alt_sc)(condition, (0, typescript_parsec_1.nil)()));
for_rest_statement.setPattern((0, interleave_comments_1.commentify)((0, typescript_parsec_1.seq)(conditionopt, interleave_comments_1.comment_parser, (0, typescript_parsec_1.str)(";"), (0, typescript_parsec_1.opt_sc)(exports.expression)), function (s) { return ({
    condition: s[0],
    expr: s[3],
}); }, function (s) { return [s[1]]; }));
jump_statement.setPattern((0, interleave_comments_1.nodeify_commented)((0, typescript_parsec_1.alt_sc)((0, interleave_comments_1.commentify)((0, typescript_parsec_1.seq)((0, typescript_parsec_1.alt_sc)((0, useful_combinators_1.lstr)("continue"), (0, useful_combinators_1.lstr)("break"), (0, useful_combinators_1.lstr)("discard")), interleave_comments_1.comment_parser, (0, typescript_parsec_1.str)(";")), function (s) { return ({ type: s[0], _isStmt: true }); }, function (s) { return [s[1]]; }), (0, interleave_comments_1.commentify)((0, typescript_parsec_1.seq)((0, typescript_parsec_1.str)("return"), (0, typescript_parsec_1.opt_sc)(exports.expression), interleave_comments_1.comment_parser, (0, typescript_parsec_1.str)(";")), function (s) { return ({ type: "return", expr: s[1], _isStmt: true }); }, function (s) { return [s[2]]; }))));
exports.translation_unit.setPattern((0, interleave_comments_1.nodeify_commented)((0, interleave_comments_1.commentify_no_comments_before)((0, typescript_parsec_1.seq)((0, typescript_parsec_1.rep_sc)(exports.external_declaration), interleave_comments_1.comment_parser), function (s) { return s[0]; }, function (s) { return [s[1]]; })));
var import_option = (0, interleave_comments_1.nodeify_commented)((0, interleave_comments_1.commentify)((0, typescript_parsec_1.seq)((0, typescript_parsec_1.tok)(lexer_1.TokenKind.Identifier), (0, typescript_parsec_1.opt_sc)((0, typescript_parsec_1.seq)(interleave_comments_1.comment_parser, (0, typescript_parsec_1.str)("as"), interleave_comments_1.comment_parser, (0, typescript_parsec_1.tok)(lexer_1.TokenKind.Identifier)))), function (s) { var _a; return ({ name: s[0].text, alias: (_a = s[1]) === null || _a === void 0 ? void 0 : _a[3].text }); }, function (s) { return (s[1] ? [s[1][0], s[1][2]] : []); }));
var import_decl = (0, interleave_comments_1.nodeify_commented)((0, interleave_comments_1.commentify)((0, typescript_parsec_1.seq)((0, typescript_parsec_1.str)("import"), interleave_comments_1.comment_parser, (0, typescript_parsec_1.alt_sc)((0, interleave_comments_1.commentify)((0, typescript_parsec_1.seq)((0, typescript_parsec_1.str)("*"), (0, typescript_parsec_1.opt_sc)((0, typescript_parsec_1.seq)(interleave_comments_1.comment_parser, (0, typescript_parsec_1.str)("as"), interleave_comments_1.comment_parser, (0, typescript_parsec_1.tok)(lexer_1.TokenKind.Identifier)))), function (s) { var _a, _b, _c; return ({ type: "all", prefix: (_c = (_b = (_a = s[1]) === null || _a === void 0 ? void 0 : _a[3]) === null || _b === void 0 ? void 0 : _b.text) !== null && _c !== void 0 ? _c : "" }); }, function (s) { return (s[1] ? [s[1][0], s[1][2]] : []); }), (0, interleave_comments_1.commentify)((0, typescript_parsec_1.seq)((0, typescript_parsec_1.str)("{"), (0, typescript_parsec_1.opt_sc)((0, typescript_parsec_1.seq)(import_option, (0, typescript_parsec_1.rep_sc)((0, typescript_parsec_1.seq)(interleave_comments_1.comment_parser, (0, typescript_parsec_1.str)(","), import_option)))), interleave_comments_1.comment_parser, (0, typescript_parsec_1.str)("}")), function (s) {
    var _a;
    return ({
        type: "some",
        imports: s[1]
            ? __spreadArray([s[1][0]], ((_a = s[1][1].map(function (e) { return e[2]; })) !== null && _a !== void 0 ? _a : []), true) : [],
    });
}, function (s) { var _a, _b; return __spreadArray(__spreadArray([], ((_b = (_a = s[1]) === null || _a === void 0 ? void 0 : _a[1].map(function (s) { return s[0]; })) !== null && _b !== void 0 ? _b : []), true), [s[2]], false); })), interleave_comments_1.comment_parser, (0, typescript_parsec_1.str)("from"), interleave_comments_1.comment_parser, (0, typescript_parsec_1.tok)(lexer_1.TokenKind.ImportString), interleave_comments_1.comment_parser, (0, typescript_parsec_1.str)(";")), function (s) {
    return ({
        type: "import",
        imports: s[2],
        from: s[6].text.slice(1, -1),
    });
}, function (s) { return [s[1], s[5], s[7]]; }));
exports.external_declaration.setPattern((0, typescript_parsec_1.alt_sc)(import_decl, function_definition, (0, interleave_comments_1.nodeify)((0, typescript_parsec_1.apply)(exports.declaration, function (s) { return ({
    type: "declaration",
    decl: s,
    _isExtDecl: true,
}); }))));
function_definition.setPattern((0, interleave_comments_1.nodeify_commented)((0, interleave_comments_1.commentify)((0, typescript_parsec_1.seq)(exports.function_prototype, compound_statement_no_new_scope), function (s) { return ({
    type: "function",
    prototype: s[0],
    body: s[1],
    _isExtDecl: true,
}); }, function (s) { return []; })));
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
`])}],["parser-combined.js",{type:"file",contents:new Blob([`"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.lexGLSL = lexGLSL;
exports.tryParseGLSLRaw = tryParseGLSLRaw;
exports.parseWith = parseWith;
exports.parseGLSLFragmentWithoutPreprocessing = parseGLSLFragmentWithoutPreprocessing;
exports.parseGLSLWithoutPreprocessing = parseGLSLWithoutPreprocessing;
var typescript_parsec_1 = require("typescript-parsec");
var result_1 = require("../utils/result");
var lexer_1 = require("./lexer");
var parser_1 = require("./parser");
function lexGLSL(source) {
    var tokens = lexer_1.lexer.parse(source);
    return (0, result_1.ok)(tokens);
}
function tryParseGLSLRaw(tokens, parser) {
    var result = (0, typescript_parsec_1.expectSingleResult)((0, typescript_parsec_1.expectEOF)(parser.parse(tokens)));
    return result;
}
function parseWith(str, parser) {
    return tryParseGLSLRaw(lexGLSL(str).unsafeExpectSuccess(), parser);
}
function parseGLSLFragmentWithoutPreprocessing(source, parser) {
    var tokens = lexGLSL(source);
    if (!tokens.data.success)
        return (0, result_1.err)(tokens.data.error);
    try {
        var data = (0, typescript_parsec_1.expectSingleResult)((0, typescript_parsec_1.expectEOF)(parser.parse(tokens.data.data)));
        return (0, result_1.ok)(data);
    }
    catch (error) {
        return (0, result_1.err)({ why: (error !== null && error !== void 0 ? error : "").toString() });
    }
}
function parseGLSLWithoutPreprocessing(source) {
    var tokens = lexGLSL(source);
    if (!tokens.data.success)
        return (0, result_1.err)(tokens.data.error);
    try {
        var translationUnit = (0, typescript_parsec_1.expectSingleResult)((0, typescript_parsec_1.expectEOF)(parser_1.translation_unit.parse(tokens.data.data)));
        return (0, result_1.ok)({
            translationUnit: translationUnit,
        });
    }
    catch (error) {
        return (0, result_1.err)({ why: (error !== null && error !== void 0 ? error : "").toString() });
    }
}
`])}],["parser-combined.d.ts",{type:"file",contents:new Blob([`import { Parser, Token } from "typescript-parsec";
import { Result } from "../utils/result";
import { TokenKind } from "./lexer";
import { TranslationUnit } from "./parser";
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
`])}],["get-inputs-outputs.js",{type:"file",contents:new Blob([`"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getInputsOutputsAndUniforms = getInputsOutputsAndUniforms;
var GLMessageProtocol_1 = require("../components/iframe-runtime/GLMessageProtocol");
function getInputsOutputsAndUniforms(tu) {
    var _a, _b, _c, _d, _e, _f;
    var uniforms = {};
    var inputs = {};
    var outputs = {};
    for (var _i = 0, _g = tu.data; _i < _g.length; _i++) {
        var ed = _g[_i];
        if (ed.data.type === "declaration") {
            var decl = ed.data.decl.data;
            if (decl.type === "declarator-list") {
                var init = decl.declaratorList.data.init.data;
                if (init.type === "type") {
                    var qualifier = (_a = init.declType.data.qualifier) === null || _a === void 0 ? void 0 : _a.data;
                    var specifier = init.declType.data.specifier.data.specifier.data.typeName.data;
                    var typeDesc = void 0;
                    if (specifier.type === "builtin") {
                        var typename = specifier.name.data;
                        typeDesc = (0, GLMessageProtocol_1.typeNameToGLPrimitive)(typename);
                        if (!typeDesc) {
                            typeDesc = {
                                type: "sampler",
                                dimensionality: "2D",
                                samplerType: "float",
                            };
                        }
                    }
                    if (qualifier && typeDesc) {
                        var isUniform = ((_b = qualifier.storageQualifier) === null || _b === void 0 ? void 0 : _b.data) === "uniform";
                        var isIn = (_d = (_c = qualifier.storageQualifier) === null || _c === void 0 ? void 0 : _c.data) === null || _d === void 0 ? void 0 : _d.endsWith("in");
                        var isOut = (_f = (_e = qualifier.storageQualifier) === null || _e === void 0 ? void 0 : _e.data) === null || _f === void 0 ? void 0 : _f.endsWith("out");
                        for (var _h = 0, _j = decl.declaratorList.data.declarations.data; _h < _j.length; _h++) {
                            var item = _j[_h];
                            var name_1 = item.data.name.data;
                            if (isUniform) {
                                uniforms[name_1] = typeDesc;
                            }
                            else if (isIn && typeDesc.type !== "sampler") {
                                inputs[name_1] = typeDesc;
                            }
                            else if (isOut && typeDesc.type !== "sampler") {
                                outputs[name_1] = typeDesc;
                            }
                        }
                    }
                }
            }
        }
    }
    return { uniforms: uniforms, inputs: inputs, outputs: outputs };
}
`])}],["get-inputs-outputs.d.ts",{type:"file",contents:new Blob([`import { GLPrimitive, UniformType } from "../components/iframe-runtime/GLMessageProtocol";
import { TranslationUnit } from "./parser";
export declare function getInputsOutputsAndUniforms(tu: TranslationUnit): {
    uniforms: Record<string, UniformType>;
    inputs: Record<string, GLPrimitive>;
    outputs: Record<string, GLPrimitive>;
};
`])}]])}]])}]])};var r=e;export{r as default};
//# sourceMappingURL=EvalboxDefsWrapper.js.map
