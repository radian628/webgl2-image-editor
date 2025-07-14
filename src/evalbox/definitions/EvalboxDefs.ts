import * as userInterface from "../runtime/EvalboxUIWrapper";
import { createGLMessageClient } from "../runtime/GLMessageClient";
import * as glclient from "../runtime/GLMessageClient";
import * as glm from "../../gl-message/protocol/GLMessageProtocol";

declare global {
  type GLMessageClient = ReturnType<typeof createGLMessageClient>;
  function loop(callback: (time: number) => any): () => void;
  const ui: userInterface.UI;
  const range: typeof glclient.range;
  type UniformType = glm.UniformType;
  type UniformsToValues<G extends Record<string, UniformType>> =
    glm.UniformsToValues<G>;
}
