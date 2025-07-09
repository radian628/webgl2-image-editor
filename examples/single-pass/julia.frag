#version 300 es
precision highp float;

in vec2 pos;
out vec4 col;

uniform float zoom;
uniform vec2 center;
uniform float iterations;
uniform vec2 c;

void main() {
  vec2 z = pos * zoom - center;

  bool escaped = false;

  for (float i = 0.0; i < iterations; i++) {
    z = vec2(
      z.x * z.x - z.y * z.y,
      2.0 * z.x * z.y
    ) + c;

    if (length(z) > 2.0) {
      col = vec4(vec3(i / iterations) * vec3(4.0, 2.0, 1.0), 1.0);
      escaped = true; 
    }
  }

  if (!escaped) 
    col = vec4(0.0, 0.0, 0.0, 1.0);
}