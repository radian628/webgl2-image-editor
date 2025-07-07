#version 300 es
precision highp float;

in vec2 pos;
out vec4 col;

void main() {
  vec2 c = pos * 2.0;
  vec2 z = vec2(0);

  bool escaped = false;

  for (float i = 0.0; i < 64.0; i++) {
    z = vec2(
      z.x * z.x - z.y * z.y,
      2.0 * z.x * z.y
    ) + c;

    if (length(z) > 2.0) {
      col = vec4(i / 16.0, i / 32.0, i / 64.0, 1.0);
      escaped = true; 
    }
  }

  if (!escaped) 
    col = vec4(0.0, 0.0, 0.0, 1.0);
}