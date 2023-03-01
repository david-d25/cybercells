#version 300 es

precision highp float;
precision highp sampler2D;

const float WALL_THICKNESS = 2.0;

struct Wall {
    vec2 a;
    vec2 b;
};

uniform sampler2D image;
uniform vec2 imageSize;
uniform mat4 fragmentViewTransform;
uniform mat4 cameraTransform;
uniform Wall wall;

in vec2 texel;
out vec4 color;

vec2 projectToWall(vec2 p) {
    vec2 a = wall.a;
    vec2 b = wall.b;
    if (a == b)
        return a;
    return (b - a) * dot(p - a, b - a) / dot(b - a, b - a) + a;
}

void main() {
    vec4 fragment = cameraTransform * fragmentViewTransform * gl_FragCoord;
    float x = fragment.x;
    float y = fragment.y;

    vec4 background = texture(image, texel);
    vec4 layerColor = vec4(0);

    vec2 projected = projectToWall(fragment.xy);
    float fractionalDistance = length(projected - wall.a) / length(wall.b - wall.a) * sign(dot(wall.b - wall.a, projected - wall.a));

    if (length(fragment.xy - projected) < WALL_THICKNESS/2.0
        && fractionalDistance >= 0.0 && fractionalDistance < 1.0
        || length(wall.a - fragment.xy) < WALL_THICKNESS/2.0
        || length(wall.b - fragment.xy) < WALL_THICKNESS/2.0)
        layerColor = vec4(0, 0, 0, 1);

    color = mix(background, vec4(layerColor.rgb, 1), layerColor.a);
}