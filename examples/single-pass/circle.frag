#version 300 es
precision highp float;

in vec2 pos2;
out vec4 col; 

void main() { 
  col = vec4(vec3(length(pos2) > 0.75 ? 1.0 : 0.0), 1.0); 
}