import { createGLMessageClient } from "./GLMessageClient";
import { GLPrimitive, ProgramRef, ShaderRef } from "./GLMessageProtocol";

type GLMessageClient = ReturnType<typeof createGLMessageClient>;

declare global {
  const clear: GLMessageClient["clear"];
  const createBufferFromArray: GLMessageClient["createBufferFromArray"];
  function linkProgram<
    VertexShader extends ShaderRef<"vertex">,
    FragmentShader extends ShaderRef<"fragment">,
  >(
    vertex: VertexShader,
    fragment: FragmentShader
  ): VertexShader["outputs"] extends FragmentShader["inputs"]
    ? FragmentShader["inputs"] extends VertexShader["outputs"]
      ? Promise<{
          inputs: VertexShader["inputs"];
          outputs: FragmentShader["outputs"];
          uniforms: VertexShader["uniforms"] & FragmentShader["uniforms"];
          id: string;
        }>
      : undefined
    : undefined;
  const sendGLMessage: GLMessageClient["sendGLMessage"];
  const draw: GLMessageClient["draw"];
  const create8BitRGBATexture: GLMessageClient["create8BitRGBATexture"];
}
