#version 300 es
precision highp float;

in vec2 pos;
out vec2 pos2; 

uniform vec2 bottom_left;
uniform vec2 top_right;

void main() { 
  pos2 = pos; 
  gl_Position = vec4(pos * (top_right - bottom_left) + bottom_left, 0.5, 1.0); 
}