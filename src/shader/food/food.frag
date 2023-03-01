#version 300 es

precision highp float;
precision highp sampler2D;

const vec3 FOOD_COLOR = vec3(0.66, 0.41, 0.13);

uniform sampler2D image;
uniform vec2 imageSize;
uniform mat4 fragmentViewTransform;
uniform mat4 cameraTransform;
in vec2 texel;
out vec4 color;

in vec2 foodCenter;
in float foodRadius;

void main() {
    vec4 fragment = cameraTransform * fragmentViewTransform * gl_FragCoord;

    color = texture(image, texel);

    float centerDistance = length(fragment.xy - foodCenter);
    if (centerDistance <= foodRadius)
        color = vec4(FOOD_COLOR, 1);
}