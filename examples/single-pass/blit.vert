#version 300 es
precision highp float;

in vec2 in_pos;
out vec2 pos; 

void main() { 
  pos = in_pos; 
  gl_Position = vec4(in_pos, 0.5, 1.0); 
}