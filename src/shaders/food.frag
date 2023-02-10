#version 300 es

precision highp float;
precision highp sampler2D;

const vec3 FOOD_COLOR = vec3(0.66, 0.41, 0.13);
const int MAX_FOOD_PER_DRAW = 256;

struct Food {
    vec2 center;
    float radius;
};

uniform sampler2D image;
uniform vec2 imageSize;
uniform mat4 viewMatrix;

uniform Food food[MAX_FOOD_PER_DRAW];
uniform int foodNumber;

in vec2 texel;
out vec4 color;

void main() {
    vec4 fragment = viewMatrix * gl_FragCoord;

    color = texture(image, texel);

    for (int i = 0; i < foodNumber; i++) {
        float centerDistance = length(fragment.xy - food[i].center);
        if (centerDistance <= food[i].radius) {
            color = vec4(FOOD_COLOR, 1);
            break;
        }
    }
}