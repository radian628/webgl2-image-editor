import { UIOption } from "../GLMessageUI";

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

const defaultFloatOptions = {
  type: "number",
  step: 0.0001,
  min: undefined,
  max: undefined,
  scaling: "log",
  sensitivity: 0.001,
} as const;

const defaultIntOptions = {
  type: "number",
  step: 1,
  min: undefined,
  max: undefined,
  scaling: "log",
  sensitivity: 0.03,
} as const;

const defaultUIntOptions = {
  type: "number",
  step: 1,
  min: 0,
  max: undefined,
  scaling: "log",
  sensitivity: 0.03,
} as const;

export const ui = {
  menu<F extends Record<string, UIOption>>(
    name: string,
    fields: F,
    desc: string
  ) {
    return {
      type: "menu",
      fields,
      desc,
    } as const satisfies UIOption;
  },

  float(defaultValue: number, options?: FloatOptions) {
    return {
      count: 1,
      defaultValue,
      ...defaultFloatOptions,
      ...options,
    } as const satisfies UIOption;
  },
  vec2(defaultValue: [number, number], options?: FloatOptions) {
    return {
      count: 2,
      defaultValue,
      ...defaultFloatOptions,
      ...options,
    } as const satisfies UIOption;
  },
  vec3(defaultValue: [number, number, number], options?: FloatOptions) {
    return {
      count: 3,
      defaultValue,
      ...defaultFloatOptions,
      ...options,
    } as const satisfies UIOption;
  },
  vec4(defaultValue: [number, number, number, number], options?: FloatOptions) {
    return {
      count: 4,
      defaultValue,
      ...defaultFloatOptions,
      ...options,
    } as const satisfies UIOption;
  },

  int(defaultValue: number, options?: IntOptions) {
    return {
      count: 1,
      defaultValue,
      ...defaultIntOptions,
      ...options,
    } as const satisfies UIOption;
  },
  ivec2(defaultValue: [number, number], options?: IntOptions) {
    return {
      count: 2,
      defaultValue,
      ...defaultIntOptions,
      ...options,
    } as const satisfies UIOption;
  },
  ivec3(defaultValue: [number, number, number], options?: IntOptions) {
    return {
      count: 3,
      defaultValue,
      ...defaultIntOptions,
      ...options,
    } as const satisfies UIOption;
  },
  ivec4(defaultValue: [number, number, number, number], options?: IntOptions) {
    return {
      count: 4,
      defaultValue,
      ...defaultIntOptions,
      ...options,
    } as const satisfies UIOption;
  },

  uint(defaultValue: number, options?: IntOptions) {
    return {
      count: 1,
      defaultValue,
      ...defaultUIntOptions,
      ...options,
    } as const satisfies UIOption;
  },
  uvec2(defaultValue: [number, number], options?: IntOptions) {
    return {
      count: 2,
      defaultValue,
      ...defaultUIntOptions,
      ...options,
    } as const satisfies UIOption;
  },
  uvec3(defaultValue: [number, number, number], options?: IntOptions) {
    return {
      count: 3,
      defaultValue,
      ...defaultUIntOptions,
      ...options,
    } as const satisfies UIOption;
  },
  uvec4(defaultValue: [number, number, number, number], options?: IntOptions) {
    return {
      count: 4,
      defaultValue,
      ...defaultUIntOptions,
      ...options,
    } as const satisfies UIOption;
  },
};

export type UI = typeof ui;
