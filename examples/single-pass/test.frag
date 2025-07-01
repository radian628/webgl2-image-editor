#version 300 es
precision highp float;

in vec2 pos2;
out vec4 col; 

uniform float blue; 
uniform sampler2D tex; 

void main() { 
  col = vec4(texture(tex, pos2 * 0.5 + 0.5).rg, blue, 1.0); 
}