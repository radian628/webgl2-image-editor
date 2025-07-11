import { FilesystemAdaptor } from "../../../filesystem/fs-protocol/FilesystemAdaptor";
import { FormatGLSLPacked } from "../fmt/fmt-packed";
import { getInputsOutputsAndUniforms } from "../typechecker/get-inputs-outputs";
import { makeGLSLLanguageServer } from "../langsupport/glsl-language-server";
import { getParameters } from "../parser/glsl-ast-utils";
import { parseGLSLWithoutPreprocessing } from "../parser/parser-combined";

async function generateStaticallyInferredShaders(fs: FilesystemAdaptor) {
  let outstr = "";
  let mapstr = "";
  let sigstr = "";
  async function traverseAndFindShaders(dir: string) {
    const listing = await fs.readDir(dir);

    const glslservice = makeGLSLLanguageServer({
      fs,
    });

    for (const item of listing ?? []) {
      const path = dir + "/" + item;
      if (await fs.isDir(path)) {
        traverseAndFindShaders(path);
      } else {
        if (
          item.endsWith(".frag") ||
          item.endsWith(".vert") ||
          item.endsWith(".glsl")
        ) {
          const file = await fs.readFile(path);
          if (!file) continue;
          const text = await file.text();
          const textWithoutVersion = text.replace(/^.*\#version 300 es/, "");
          const tu = parseGLSLWithoutPreprocessing(textWithoutVersion);
          if (!tu.data.success) continue;
          const inputsOutputsAndUniforms = getInputsOutputsAndUniforms(
            tu.data.data.translationUnit
          );

          const uiosString = `
              uniforms: ${JSON.stringify(inputsOutputsAndUniforms.uniforms)}
              inputs: ${JSON.stringify(inputsOutputsAndUniforms.inputs)}
              outputs: ${JSON.stringify(inputsOutputsAndUniforms.outputs)}
          `;

          const signatures = await glslservice.semanticallyAnalyzeGLSL(
            path,
            false
          );

          const signaturesMap: any = {
            retType: {},
          };

          if (signatures) {
            for (const [fnname, fn] of signatures.globalScope.items.entries()) {
              if (fn.type === "function" && fn.signatures.type === "list") {
                for (const sig of fn.signatures.list) {
                  const parameters = getParameters(sig.fndef);
                  const returnType =
                    sig.fndef.data.prototype.data.fullySpecifiedType;
                  const retTypeStr =
                    FormatGLSLPacked.fullySpecifiedType(returnType);
                  const paramTypeStrs = parameters.data.map((p) => {
                    const paramtype =
                      p.data.declaratorOrSpecifier.type === "declarator"
                        ? p.data.declaratorOrSpecifier.declarator.data
                            .typeSpecifier
                        : p.data.declaratorOrSpecifier.specifier;
                    return FormatGLSLPacked.typeSpecifier(paramtype);
                  });

                  let signaturesTemp = signaturesMap;
                  if (!signaturesTemp.retType[retTypeStr]) {
                    signaturesTemp.retType[retTypeStr] = {
                      functions: {},
                      params: {},
                    };
                  }
                  signaturesTemp = signaturesTemp.retType[retTypeStr];

                  for (const p of paramTypeStrs) {
                    if (!signaturesTemp.params[p]) {
                      signaturesTemp.params[p] = {
                        functions: {},
                        params: {},
                      };
                    }
                    signaturesTemp = signaturesTemp.params[p];
                  }

                  signaturesTemp.functions[fnname] = true;
                }
              }
            }
            sigstr += `"${path}": ${JSON.stringify(signaturesMap)},`;
          }

          // outstr += `declare function loadShader<ST extends "vertex" | "fragment">(path: "${path}", type: ST): {
          //     id: string,
          //     shaderType: ST,
          //     ${uiosString}
          //   };\n\n`;

          mapstr += `"${path}": { ${uiosString} },`;
        }
      }
    }
  }

  await traverseAndFindShaders("root");
  return (
    outstr +
    `\n\ntype LoadShaderOverloadMap = { ${mapstr} };

\n\ntype ShaderFunctionSignaturesMap = { ${sigstr} };

declare interface GLMessageClient {
declare function loadShader<K extends keyof LoadShaderOverloadMap, ST extends "vertex" | "fragment">(
  path: K,
  shaderType: ST
): {
  id: string,
  shaderType: ST,
} & LoadShaderOverloadMap[K];
declare function loadShaderSource<K extends keyof LoadShaderOverloadMap>(
path: K
): {
  spec: LoadShaderOverloadMap[K];
  functions: ShaderFunctionSignaturesMap[K];
}
}
`
  );
}

export function watchForStaticallyInferredShaders(
  fs: FilesystemAdaptor,
  callback: (shaders: string) => void
) {
  let obj = {
    staticallyInferredShaders: "",
    unsub: () => {
      unsub();
    },
  };

  async function refresh() {
    obj.staticallyInferredShaders = await generateStaticallyInferredShaders(fs);
    callback(obj.staticallyInferredShaders);
  }

  const unsub = fs.watchPattern(
    "root",
    (path) =>
      path.endsWith(".frag") ||
      path.endsWith(".vert") ||
      path.endsWith(".glsl"),
    (path) => {
      refresh();
    }
  );

  refresh();

  return obj;
}
