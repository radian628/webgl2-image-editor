#version 300 es
precision highp float;

in vec2 pos;
out vec2 pos2; 

void main() { 
  pos2 = pos; 
  gl_Position = vec4(pos, 0.5, 1.0); 
}