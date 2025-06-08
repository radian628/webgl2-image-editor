export type PrimitiveDataType =
  | {
      type: "simple";
      dataType:
        | "float"
        | "int"
        | "uint"
        | "bool"
        | `${"i" | "u" | "" | "b"}vec${"2" | "3" | "4"}`
        | `mat${"2" | "3" | "4"}`
        | `mat2x${"3" | "4"}`
        | `mat3x${"2" | "4"}`
        | `mat4x${"2" | "3"}`;
    }
  | {
      type: "array";
      inner: PrimitiveDataType;
      length?: number;
    };

export type DataType = {
  type: "struct";
  fields: Map<string, PrimitiveDataType>;
};
