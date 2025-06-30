import { createGLMessageClient } from "./GLMessageClient";

type GLMessageClient = ReturnType<typeof createGLMessageClient>;

declare global {
  const clear: GLMessageClient["clear"];
  const createBufferFromArray: GLMessageClient["createBufferFromArray"];
  const linkProgram: GLMessageClient["linkProgram"];
  const sendGLMessage: GLMessageClient["sendGLMessage"];
}
