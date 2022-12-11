#version 300 es

precision highp float;

const float CHECKER_SIZE = 25.0;

uniform mat4 viewMatrix;
uniform float time;
uniform vec2 areaSize;

out vec4 color;

void main() {
    vec4 fragment = viewMatrix * gl_FragCoord;
    float x = fragment.x;
    float y = fragment.y;

    float value = mod(floor(x/CHECKER_SIZE) + floor(y/CHECKER_SIZE), 2.0) == 0.0 ? 0.4 : 0.2;
    color = vec4(value, value, value, 1);

    // x = 100
    if (abs(x - 100.0) < 10.0 && abs(y) < 10.0)
        color = mix(color, vec4(0, 1, 0, 1), 0.5);

    // y = 100
    if (abs(x) < 10.0 && abs(y - 100.0) < 10.0)
        color = mix(color, vec4(1, 0, 0, 1), 0.5);

    if (abs(x) < 10.0 && abs(y) < 10.0)
        color = mix(color, vec4(0, 0, 0, 1), 0.5);

    if (x < 0.0 || y < 0.0 || x >= areaSize.x || y >= areaSize.y)
        color = mix(color, vec4(0, 0, 0, 1), 0.8);
}