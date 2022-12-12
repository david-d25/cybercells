#version 300 es

precision highp float;

struct Cell {
    int id;
    vec2 center;
    vec2 speed;
    float mass;
    float angle;
    float radius;
};

uniform sampler2D image;
uniform vec2 imageSize;
uniform mat4 viewMatrix;
uniform float time;

uniform Cell cell;

in vec2 texel;
out vec4 color;

void main() {
    vec4 fragment = viewMatrix * gl_FragCoord;
    float x = fragment.x;
    float y = fragment.y;

    vec2 imagePixelSize = vec2(1.0, 1.0) / imageSize;

    color = texture(image, texel);

    if (sqrt(pow(x - cell.center.x, 2.0) + pow(y - cell.center.y, 2.0)) < cell.radius)
        color = mix(texture(image, texel), vec4(1, 1, 1, 1), 0.1);
}