#version 300 es
precision highp float;

in vec2 pos2;
out vec4 col;

uniform vec4 color; 

void main() {
  col = color;
}