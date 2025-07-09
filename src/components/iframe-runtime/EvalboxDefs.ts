import * as userInterface from "./EvalboxUIWrapper";
import { createGLMessageClient } from "./GLMessageClient";
import * as glclient from "./GLMessageClient";
import {
  GLPrimitive,
  MenuRef,
  ProgramRef,
  ShaderRef,
} from "./GLMessageProtocol";
import * as glm from "./GLMessageProtocol";
import {
  GLMessageUIField,
  Matrix4x4,
  UIOption,
  UIOptionFirstPersonControls,
  UIOptionNumerical,
  UIOptionOrbitControls,
  UIOptionSelect,
  UIReturnType,
} from "../GLMessageUI";

type GLMessageClient = ReturnType<typeof createGLMessageClient>;

declare global {
  const g: GLMessageClient;
  function loop(callback: (time: number) => any): () => void;
  const ui: userInterface.UI;
  const range: typeof glclient.range;
  type UniformType = glm.UniformType;
  type UniformsToValues<G extends Record<string, UniformType>> =
    glm.UniformsToValues<G>;
}
