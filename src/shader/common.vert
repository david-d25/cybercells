#version 300 es

in vec4 vertexPosition;
out vec2 texel;

void main() {
    gl_Position = vertexPosition;
    texel = (vertexPosition.xy + vec2(1, 1)) / vec2(2, 2);;
}