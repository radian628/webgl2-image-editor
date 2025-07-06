#version 300 es
precision highp float;

in vec2 pos;
out vec4 col;

void main() {
  col = vec4(pos * 0.5 + 0.5, 0.0, 1.0);
}