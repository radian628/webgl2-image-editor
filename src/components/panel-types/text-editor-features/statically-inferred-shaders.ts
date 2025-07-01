import { FilesystemAdaptor } from "../../../filesystem/FilesystemAdaptor";
import { getInputsOutputsAndUniforms } from "../../../glsl-analyzer/get-inputs-outputs";
import { parseGLSLWithoutPreprocessing } from "../../../glsl-analyzer/parser-combined";

async function generateStaticallyInferredShaders(fs: FilesystemAdaptor) {
  let outstr = "";
  async function traverseAndFindShaders(dir: string) {
    const listing = await fs.readDir(dir);

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

          outstr += `declare function loadShader<ST extends "vertex" | "fragment">(path: "${path}", type: ST): {
              id: string,
              shaderType: ST,
              uniforms: ${JSON.stringify(inputsOutputsAndUniforms.uniforms)}
              inputs: ${JSON.stringify(inputsOutputsAndUniforms.inputs)}
              outputs: ${JSON.stringify(inputsOutputsAndUniforms.outputs)}
            };\n\n`;
        }
      }
    }
  }

  await traverseAndFindShaders("root");
  return outstr;
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
