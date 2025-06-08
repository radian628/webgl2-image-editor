import { err, ok, Result, splitSuccessesAndErrors } from "../utils/result";

export type CreateShaderError =
  | {
      type: "failed-to-create-shader";
    }
  | {
      type: "failed-to-compile-shader";
      infoLog?: string;
    };

export function createShader(
  gl: WebGL2RenderingContext,
  source: string,
  type: GLenum
): Result<WebGLShader, CreateShaderError> {
  // see if we can create the shader
  const shader = gl.createShader(type);
  if (!shader) return err({ type: "failed-to-create-shader" });

  // see if we can compile it
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    return err({
      type: "failed-to-compile-shader",
      infoLog: gl.getShaderInfoLog(shader) ?? undefined,
    });
  }

  // return the program
  return ok(shader);
}

export type CreateProgramError =
  | {
      type: "failed-to-create-program";
    }
  | {
      type: "failed-to-link-program";
      infoLog?: string;
    };

export function createProgram(
  gl: WebGL2RenderingContext,
  vertex: WebGLShader,
  fragment: WebGLShader
): Result<WebGLProgram, CreateProgramError> {
  // can we make the program?
  const prog = gl.createProgram();
  if (!prog) return err({ type: "failed-to-create-program" });

  // can we attach the shaders and link it?
  gl.attachShader(prog, vertex);
  gl.attachShader(prog, fragment);
  gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
    return err({
      type: "failed-to-link-program",
      infoLog: gl.getProgramInfoLog(prog) ?? undefined,
    });
  }

  // return the program
  return ok(prog);
}

export function createProgramFromShaderSources(
  gl: WebGL2RenderingContext,
  vertex: string,
  fragment: string
): Result<WebGLProgram, (CreateProgramError | CreateShaderError)[]> {
  // create shaders from sources
  const maybeVShader = createShader(gl, vertex, gl.VERTEX_SHADER);
  const maybeFShader = createShader(gl, fragment, gl.FRAGMENT_SHADER);

  // see which ones succeeded and which ones failed
  const [successfulShaders, failedShaders] = splitSuccessesAndErrors([
    maybeVShader,
    maybeFShader,
  ]);

  // if any of them failed, error
  if (failedShaders.length != 0) return err(failedShaders);

  // compile the program and return the result of that
  return createProgram(gl, successfulShaders[0], successfulShaders[1]).mapE(
    (e) => [e]
  );
}
