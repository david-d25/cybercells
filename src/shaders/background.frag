#version 300 es

precision highp float;
precision highp sampler2D;

const float CHECKER_SIZE = 25.0;
const vec4 LIGHT_COLOR = vec4(0.88, 0.88, 1, 1);

uniform mat4 viewMatrix;
uniform float time;
uniform vec2 areaSize;

uniform float lightIntensity;

out vec4 color;

vec4 lightFunction(float x, float y) {
    return vec4(0, 0, 0, 0);
}

void main() {
    vec4 fragment = viewMatrix * gl_FragCoord;
    float x = fragment.x;
    float y = fragment.y;

    float value = mod(floor(x/CHECKER_SIZE) + floor(y/CHECKER_SIZE), 2.0) == 0.0 ? 0.4 : 0.2;
    color = vec4(value, value, value, 1);
//    color = vec4(0.4, 0.7, 0.9, 1);
    color = mix(color, lightFunction(x, y), lightIntensity);

    if (x < 0.0 || y < 0.0 || x >= areaSize.x || y >= areaSize.y)
        color = mix(color, vec4(0, 0, 0, 1), 0.3);
}