#version 300 es

precision highp float;
precision highp sampler2D;

uniform sampler2D image;

in vec2 texel;
out vec4 color;

void main() {
    color = texture(image, texel);
}