import {
  GLPrimitive,
  UniformType,
} from "../../../gl-message/protocol/GLMessageProtocol";
import { typeNameToGLPrimitive } from "../../../gl-message/server/GLMessageServer";
import { TranslationUnit } from "../parser/parser";

export function getInputsOutputsAndUniforms(tu: TranslationUnit) {
  const uniforms: Record<string, UniformType> = {};
  const inputs: Record<string, GLPrimitive> = {};
  const outputs: Record<string, GLPrimitive> = {};

  for (const ed of tu.data) {
    if (ed.data.type === "declaration") {
      const decl = ed.data.decl.data;
      if (decl.type === "declarator-list") {
        const init = decl.declaratorList.data.init.data;
        if (init.type === "type") {
          const qualifier = init.declType.data.qualifier?.data;
          const specifier =
            init.declType.data.specifier.data.specifier.data.typeName.data;
          let typeDesc: UniformType | undefined;
          if (specifier.type === "builtin") {
            const typename = specifier.name.data;
            typeDesc = typeNameToGLPrimitive(typename);
            if (!typeDesc) {
              typeDesc = {
                type: "sampler",
                dimensionality: "2D",
                samplerType: "float",
              };
            }
          }
          if (qualifier && typeDesc) {
            const isUniform = qualifier.storageQualifier?.data === "uniform";
            const isIn = qualifier.storageQualifier?.data?.endsWith("in");
            const isOut = qualifier.storageQualifier?.data?.endsWith("out");

            for (const item of decl.declaratorList.data.declarations.data) {
              const name = item.data.name.data;
              if (isUniform) {
                uniforms[name] = typeDesc;
              } else if (isIn && typeDesc.type !== "sampler") {
                inputs[name] = typeDesc;
              } else if (isOut && typeDesc.type !== "sampler") {
                outputs[name] = typeDesc;
              }
            }
          }
        }
      }
    }
  }

  return { uniforms, inputs, outputs };
}
