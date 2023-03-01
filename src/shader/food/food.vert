#version 300 es

uniform mat4 vertexViewTransform;
uniform mat4 cameraTransform;

in vec4 vertexPosition;
in vec2 instanceFoodCenter;
in float instanceFoodRadius;
out vec2 texel;
out vec2 foodCenter;
out float foodRadius;

void main() {
    vec4 position = vertexViewTransform * inverse(cameraTransform) * vertexPosition;
    gl_Position = position;
    texel = (position.xy + vec2(1, 1)) / vec2(2, 2);
    foodCenter = instanceFoodCenter;
    foodRadius = instanceFoodRadius;
}