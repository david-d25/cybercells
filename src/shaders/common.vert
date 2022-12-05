#version 300 es

in vec4 vertexPosition;
in vec2 textureCoordinate;
out vec2 texel;

void main() {
    gl_Position = vertexPosition;
    texel = textureCoordinate;
}