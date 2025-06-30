import React, { useEffect, useRef, useState } from "react";
import Evalbox from "../iframe-runtime/evalbox.html?raw";
import { PanelContentsItem, PanelType } from "./PanelSelector";
import {
  executeGLMessage,
  GLMessage,
  GLMessageContext,
} from "../iframe-runtime/GLMessageProtocol";
import ts from "typescript";
import * as esbuild from "esbuild-wasm";

function jsToDataURI(js: string) {
  return `data:application/javascript;base64,${btoa(js)}`;
}

let esbuildInitializing = false;
let esbuildReadyPromise: Promise<void>;
function esbuildPromise() {
  if (!esbuildInitializing) {
    esbuildReadyPromise = esbuild.initialize({
      wasmURL: "./esbuild.wasm",
    });
    esbuildInitializing = true;
  }
  return esbuildReadyPromise;
}

export function ImagePreviewPanel(props: {
  data: PanelType<"image-preview">;
  setData: (d: (d: PanelContentsItem) => PanelContentsItem) => void;
}) {
  const evalboxRef = useRef<HTMLIFrameElement>(
    document.createElement("iframe")
  );
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [file, setFile] = useState<string>();

  const [evalboxGLWrapper, setEvalboxGLWrapper] = useState<string>();

  useEffect(() => {
    (async () => {
      setEvalboxGLWrapper(
        await (
          await fetch("./components/iframe-runtime/EvalboxGLWrapper.js")
        ).text()
      );
    })();
  }, []);

  useEffect(() => {
    if (!props.data.file) return;
    const file = props.data.file;

    const cb = () =>
      (async () => {
        setFile(await (await file.fs.readFile(file.path))?.text());
      })();

    cb();

    return file.fs.watchFile(file.path, cb);
  }, [props.data.file]);

  useEffect(() => {
    if (!file || !props.data.file || !evalboxGLWrapper) return;
    const evalbox = evalboxRef.current;
    if (evalbox) {
      const esbuildResult = (async () => {
        await esbuildPromise();
        const buildResult = await esbuild.build({
          entryPoints: [props.data.file!.path],
          bundle: true,
          format: "esm",
          write: false,
          define: {
            global: "window",
          },
          plugins: [
            {
              name: "vfs",
              setup(build) {
                build.onResolve({ filter: /.*/ }, async (args) => {
                  return {
                    path: args.path,
                    namespace: "app",
                  };
                });

                build.onLoad({ filter: /.*/ }, async (args) => {
                  return {
                    contents: await (await props.data.file!.fs.readFile(
                      args.path
                    ))!.text(),
                  } satisfies esbuild.OnLoadResult;
                });
              },
            },
          ],
        });
        return buildResult.outputFiles[0].text;
      })();

      evalbox.addEventListener("load", () => {
        (async () => {
          evalbox.contentWindow!.postMessage(
            {
              type: "exec",
              src: jsToDataURI(evalboxGLWrapper),
            },
            "*"
          );
          evalbox.contentWindow!.postMessage(
            {
              type: "exec",
              src: jsToDataURI(await esbuildResult),
            },
            "*"
          );
        })();
      });

      const buffers = new Map<string, WebGLBuffer>();
      const shaders = new Map<string, WebGLShader>();
      const programs = new Map<string, WebGLProgram>();

      evalbox.setAttribute("sandbox", "allow-scripts");
      evalbox.setAttribute("origin", window.location.origin);
      evalbox.srcdoc = Evalbox;
      evalbox.style.display = "none";
      document.body.appendChild(evalbox);
      window.addEventListener("message", (e) => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const gl = canvas.getContext("webgl2");
        if (!gl) return;
        const vao = gl.createVertexArray();
        gl.bindVertexArray(vao);
        gl.viewport(0, 0, canvas.width, canvas.height);
        const context: GLMessageContext = {
          gl,
          buffers,
          shaders,
          programs,
        };

        (async () => {
          evalbox.contentWindow!.postMessage(
            await executeGLMessage(e.data as GLMessage, context),
            "*"
          );
        })();
      });
      return () => void document.body.removeChild(evalbox);
    }
  }, [file, props.data.file, evalboxGLWrapper]);

  return (
    <div className="image-preview-panel-container">
      <canvas ref={canvasRef}></canvas>
    </div>
  );
}
