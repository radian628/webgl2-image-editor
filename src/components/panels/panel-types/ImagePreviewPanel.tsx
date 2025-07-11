import React, { createRef, useEffect, useRef, useState } from "react";
import Evalbox from "../../../evalbox/runtime/evalbox.html?raw";
import { PanelContentsItem, PanelType } from "../../input-fields/PanelSelector";
import { GLMessage } from "../../../gl-message/protocol/GLMessageProtocol";
import * as esbuild from "esbuild-wasm";
import { v4 } from "uuid";
import {
  GLMessageUIExternalContext,
  GLMessageUIField,
  UIOption,
} from "../../gl-message-ui/GLMessageUI";
import "./ImagePreviewPanel.css";
import {
  executeGLMessage,
  GLMessageContext,
} from "../../../gl-message/server/GLMessageServer";

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

export function execEvalbox(evalbox: HTMLIFrameElement, code: string) {
  return new Promise<void>((resolve, reject) => {
    const evalId = v4();
    const listener = (e: MessageEvent) => {
      if (e.data.type === "exec-response" && e.data.id === evalId) {
        window.removeEventListener("message", listener);
        resolve();
      }
    };
    window.addEventListener("message", listener);
    evalbox.contentWindow!.postMessage(
      {
        type: "exec",
        src: jsToDataURI(code),
        id: evalId,
      },
      "*"
    );
  });
}

let lastDrawCallCount = 0;
let drawCalls = 0;

let lastMessageCount = 0;
let messages = 0;

setInterval(() => {
  // console.log("draw calls in the last second", drawCalls - lastDrawCallCount);
  // console.log("messages in the last second", messages - lastMessageCount);
  lastDrawCallCount = drawCalls;
  lastMessageCount = messages;
}, 1000);

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

  const zoomPanRef = useRef<{
    bottomLeft: [number, number];
    topRight: [number, number];
  }>({
    bottomLeft: [-2, -2],
    topRight: [2, 2],
  });

  const [controls, setControls] = useState<GLMessageUIExternalContext>({
    panBottomLeft: [-2, -2],
    panTopRight: [2, 2],
  });

  const ffmpegFrameCountRef = useRef(0);

  const videoRef = useRef<GLMessageContext["videoRef"]["current"]>({
    frameIndex: 0,
    framerate: 30,
  } as GLMessageContext["videoRef"]["current"]);

  useEffect(() => {
    zoomPanRef.current.bottomLeft = controls.panBottomLeft;
    zoomPanRef.current.topRight = controls.panTopRight;
  }, [controls]);

  useEffect(() => {
    (async () => {
      setEvalboxGLWrapper(
        await (await fetch("./evalbox/runtime/EvalboxGLWrapper.js")).text()
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

  const [menuValues, setMenuValues] = useState<
    Record<
      string,
      {
        spec: UIOption;
        value: any;
      }
    >
  >({});
  const menus = useRef(new Map<string, { spec: UIOption; value: any }>());
  const containerRef = createRef<HTMLDivElement | null>();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const mouseDownListener = (e: MouseEvent) => {
      isMouseDown = true;
    };

    let mouseX = 0;
    let mouseY = 0;
    let isMouseDown = false;

    const mouseMoveListener = (e: MouseEvent) => {
      mouseX = 1 - e.offsetX / canvas.width;
      mouseY = e.offsetY / canvas.height;
      if (isMouseDown) {
        setControls((ui) => {
          const width = ui.panTopRight[0] - ui.panBottomLeft[0];
          const height = ui.panTopRight[1] - ui.panBottomLeft[1];
          const dx = (e.movementX / canvas.width) * width;
          const dy = (e.movementY / canvas.height) * height;
          return {
            ...ui,
            panBottomLeft: [ui.panBottomLeft[0] + dx, ui.panBottomLeft[1] - dy],
            panTopRight: [ui.panTopRight[0] + dx, ui.panTopRight[1] - dy],
          };
        });
      }
    };

    const mouseUpListener = (e: MouseEvent) => {
      isMouseDown = false;
    };

    function lerp(x: number, a: number, b: number) {
      return a * (1 - x) + b * x;
    }

    const wheelListener = (e: WheelEvent) => {
      let delta = e.deltaY;
      if (e.deltaMode === 0x1) {
        delta *= 20;
      } else if (e.deltaMode === 0x2) {
        delta *= window.innerHeight;
      }

      const lerpFactor = delta / 1000;

      setControls((ui) => {
        const cx = lerp(mouseX, ui.panBottomLeft[0], ui.panTopRight[0]);
        const cy = lerp(mouseY, ui.panBottomLeft[1], ui.panTopRight[1]);

        const newBottomLeftX = lerp(lerpFactor, ui.panBottomLeft[0], cx);
        const newBottomLeftY = lerp(lerpFactor, ui.panBottomLeft[1], cy);
        const newTopRightX = lerp(lerpFactor, ui.panTopRight[0], cx);
        const newTopRightY = lerp(lerpFactor, ui.panTopRight[1], cy);

        return {
          ...ui,
          panBottomLeft: [newBottomLeftX, newBottomLeftY],
          panTopRight: [newTopRightX, newTopRightY],
        };
      });
    };

    canvas.addEventListener("mousedown", mouseDownListener);
    canvas.addEventListener("wheel", wheelListener);
    document.addEventListener("mousemove", mouseMoveListener);
    document.addEventListener("mouseup", mouseUpListener);

    return () => {
      document.removeEventListener("mousemove", mouseMoveListener);
      document.removeEventListener("mouseup", mouseUpListener);
      canvas.removeEventListener("mousedown", mouseDownListener);
      canvas.removeEventListener("wheel", wheelListener);
    };
  }, []);

  useEffect(() => {
    for (const [k, v] of menus.current) {
      menus.current.delete(k);
    }
    for (const [k, v] of Object.entries(menuValues)) {
      menus.current.set(k, v);
    }
  }, [menuValues]);

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
                  const filestr = await (await props.data.file!.fs.readFile(
                    args.path
                  ))!.text();
                  return {
                    contents: filestr,
                    loader: "ts",
                  } satisfies esbuild.OnLoadResult;
                });
              },
            },
          ],
        });
        return buildResult.outputFiles[0].text;
      })();

      const evalboxLoadListener = () => {
        (async () => {
          await execEvalbox(evalbox, evalboxGLWrapper);
          await execEvalbox(evalbox, await esbuildResult);
        })();
      };

      evalbox.addEventListener("load", evalboxLoadListener);

      const buffers = new Map<string, WebGLBuffer>();
      const shaders = new Map<string, WebGLShader>();
      const programs = new Map<string, WebGLProgram>();
      const textures = new Map<string, WebGLTexture>();
      setMenuValues((values) => ({}));

      evalbox.setAttribute("sandbox", "allow-scripts");
      evalbox.setAttribute("origin", window.location.origin);
      evalbox.src = "/evalbox/runtime/";
      evalbox.srcdoc = Evalbox;
      evalbox.style.opacity = "0";
      evalbox.style.pointerEvents = "none";
      evalbox.style.position = "absolute";
      evalbox.style.top = "0";
      evalbox.style.left = "0";
      document.body.appendChild(evalbox);

      const container = containerRef.current;

      let vao: WebGLVertexArrayObject;

      const messageListener = (e: MessageEvent) => {
        const msgstart = performance.now();
        const canvas = canvasRef.current;
        if (!canvas) return;
        const gl = canvas.getContext("webgl2");
        if (!gl) return;
        if (!vao) {
          vao = gl.createVertexArray();
          gl.bindVertexArray(vao);
        }
        gl.viewport(0, 0, canvas.width, canvas.height);
        const context: GLMessageContext = {
          gl,
          buffers,
          shaders,
          programs,
          textures,
          menus: menus.current,
          fs: props.data.file!.fs,
          canvas,
          container: { current: container },
          zoomPan: zoomPanRef,
          videoRef,
        };

        (async () => {
          evalbox.contentWindow!.postMessage(
            await executeGLMessage(e.data as GLMessage, context),
            "*"
          );
          const glm = e.data as GLMessage;
          messages++;
          if (glm && glm.contents && glm.contents.type === "draw") drawCalls++;
          if (glm && glm.contents && glm.contents.type === "create-menu")
            setMenuValues((values) => ({
              ...Object.fromEntries(menus.current.entries()),
              ...values,
            }));
        })();
      };

      window.addEventListener("message", messageListener);
      return () => {
        void document.body.removeChild(evalbox);
        window.removeEventListener("message", messageListener);
        evalbox.removeEventListener("load", evalboxLoadListener);
      };
    }
  }, [file, props.data.file, evalboxGLWrapper]);

  return (
    <div className="image-preview-panel-container" ref={containerRef}>
      <canvas ref={canvasRef}></canvas>
      {Object.entries(menuValues).map(([k, v]) => (
        <GLMessageUIField
          value={v.value}
          setValue={(nv) =>
            setMenuValues((values) => ({
              ...values,
              [k]: { spec: values[k].spec, value: nv(values[k].value) },
            }))
          }
          template={v.spec}
        ></GLMessageUIField>
      ))}
    </div>
  );
}
