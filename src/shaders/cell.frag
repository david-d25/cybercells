#version 300 es

precision highp float;
precision highp sampler2D;

const float CELL_BORDER_WIDTH = 2.0;

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

vec4 previousLayerColor(float x, float y) {
    vec2 imagePixelSize = vec2(1.0, 1.0) / imageSize;
    return texture(image, vec2(texel.x + x * imagePixelSize.x, texel.y + y * imagePixelSize.y));
}

void main() {
    vec4 fragment = viewMatrix * gl_FragCoord;
    float x = fragment.x;
    float y = fragment.y;

    vec2 imagePixelSize = vec2(1.0, 1.0) / imageSize;

    vec4 background = texture(image, texel);
    vec4 layerColor = vec4(0);

    vec4 bodyColor = vec4(1, 1, 1, 0.8);
    vec4 borderColor = mix(bodyColor, vec4(0, 0, 0, 1), 0.25);
    float centerDistance = sqrt(pow(x - cell.center.x, 2.0) + pow(y - cell.center.y, 2.0));

    if (centerDistance < cell.radius){
        layerColor = bodyColor;
        if (centerDistance > cell.radius - CELL_BORDER_WIDTH)
            layerColor = borderColor;
    }

    color = mix(background, vec4(layerColor.rgb, 1), layerColor.a);
}