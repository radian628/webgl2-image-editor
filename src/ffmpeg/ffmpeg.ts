import { FFmpeg } from "@ffmpeg/ffmpeg";

let cachedffmpeg: FFmpeg | undefined;
export async function getffmpeg() {
  if (cachedffmpeg) return cachedffmpeg;

  cachedffmpeg = new FFmpeg();

  await cachedffmpeg.load({
    coreURL: "./ffmpeg-core.js",
    wasmURL: "./ffmpeg-core.wasm",
    // workerURL: "./ffmpeg-core.worker.js",
    classWorkerURL: "./ffmpeg/worker.js",
  });

  return cachedffmpeg;
}
