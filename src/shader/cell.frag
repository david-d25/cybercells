#version 300 es

precision highp float;
precision highp sampler2D;

const float POSITIVE_INFINITY = 1.0 / 0.0;
const float NAN = 0.0 / 0.0;
const float EPSILON = 0.0000001;

const float CELL_BORDER_WIDTH = 2.0;
const int MAX_OBSTACLES = 32;

struct Cell {
    int id;
    vec2 center;
    vec2 speed;
    float mass;
    float angle;
    float radius;
    vec4 bodyRgba;
};

struct Obstacle {
    vec2 a;
    vec2 b;
};

uniform sampler2D image;
uniform vec2 imageSize;
uniform mat4 fragmentViewTransform;
uniform mat4 cameraTransform;
uniform float time;

uniform Cell cell;

uniform Obstacle obstacles[MAX_OBSTACLES];
uniform int obstaclesSize;

in vec2 texel;
out vec4 color;

vec4 previousLayerColor(float x, float y) {
    vec2 imagePixelSize = vec2(1.0, 1.0) / imageSize;
    return texture(image, vec2(texel.x + x * imagePixelSize.x, texel.y + y * imagePixelSize.y));
}

vec2 projectPointOntoLine(vec2 p, vec2 lineStart, vec2 lineEnd) {
    vec2 a = lineStart;
    vec2 b = lineEnd;
    if (abs(a.x - b.x) < EPSILON)
        return vec2(a.x, p.y);
    return (b - a) * dot(p - a, b - a) / dot(b - a, b - a) + a;
}

vec2 findVerticalLineIntersection(vec2 verticalStart, vec2 verticalEnd, vec2 otherStart, vec2 otherEnd) {
    if (otherStart.x == otherEnd.x)
        return vec2(NAN);

    float otherAngleRatio = (otherEnd.y - otherStart.y) / (otherEnd.x - otherStart.x);
    float otherOffset = otherStart.y - otherAngleRatio * otherStart.x;
    vec2 intersection = vec2(verticalStart.x, 0);
    intersection.y = otherAngleRatio * intersection.x + otherOffset;
    if (otherStart.x < intersection.x && otherEnd.x < intersection.x ||
        otherStart.x > intersection.x && otherEnd.x > intersection.x)
        return vec2(NAN);
    float avgY = (verticalStart.y + verticalEnd.y)/2.0;
    float height = abs(verticalStart.y - verticalEnd.y);
    return abs(intersection.y - avgY) <= height/2.0 ? intersection : vec2(NAN);
}

vec2 findLinesIntersections(vec2 line1Start, vec2 line1End, vec2 line2Start, vec2 line2End) {
    vec2 line1Vector = line1End - line1Start;
    vec2 line2Vector = line2End - line2Start;

    float angle1Ratio = line1Vector.y / line1Vector.x;
    float angle2Ratio = line2Vector.y / line2Vector.x;

    if (isnan(angle1Ratio) || isnan(angle2Ratio)
        || isinf(angle1Ratio) && isinf(angle2Ratio)
        || angle1Ratio == angle2Ratio)
        return vec2(NAN);

    if (isinf(angle1Ratio))
        return findVerticalLineIntersection(line1Start, line1End, line2Start, line2End);
    if (isinf(angle2Ratio))
        return findVerticalLineIntersection(line2Start, line2End, line1Start, line1End);

    float line1Offset = line1Start.y - angle1Ratio * line1Start.x;
    float line2Offset = line2Start.y - angle2Ratio * line2Start.x;

    vec2 intersection = vec2((line2Offset - line1Offset) / (angle1Ratio - angle2Ratio), 0);
    intersection.y = angle1Ratio * intersection.x + line1Offset;

    vec2 v1 = intersection - line1Start;
    vec2 v2 = intersection - line2Start;
    return (
        dot(line1Vector, v1) >= 0.0 &&
        dot(line1Vector, v1) <= dot(line1Vector, line1Vector) &&
        dot(line2Vector, v2) >= 0.0 &&
        dot(line2Vector, v2) <= dot(line2Vector, line2Vector)
    ) ? intersection : vec2(NAN);
}

float nearestObstacleDistance(vec2 p) {
    float result = POSITIVE_INFINITY;

    for (int i = 0; i < obstaclesSize; i++) {
        Obstacle obstacle = obstacles[i];
        vec2 projected = projectPointOntoLine(p, obstacle.a, obstacle.b);
        float fractionalDistance = length(projected - obstacle.a) / length(obstacle.b - obstacle.a) * sign(dot(obstacle.b - obstacle.a, projected - obstacle.a));
        if (fractionalDistance >= 0.0 && fractionalDistance < 1.0 && length(projected - p) < result)
            result = length(projected - p);
    }

    return result;
}

bool isPointBehindLine(vec2 p, vec2 lineStart, vec2 lineEnd) {
    return !any(isnan(findLinesIntersections(cell.center, p, lineStart, lineEnd)));
}

bool isPointBehindObstacles(vec2 p) {
    for (int i = 0; i < obstaclesSize; i++) {
        Obstacle obstacle = obstacles[i];
        if (isPointBehindLine(p, obstacle.a, obstacle.b))
            return true;
    }

    return false;
}

void main() {
    vec4 fragment = cameraTransform * fragmentViewTransform * gl_FragCoord;
    float x = fragment.x;
    float y = fragment.y;

    vec2 imagePixelSize = vec2(1.0, 1.0) / imageSize;

    vec4 background = texture(image, texel);
    vec4 layerColor = vec4(0);

    vec4 borderColor = mix(cell.bodyRgba, vec4(0, 0, 0, 1), 0.25);
    float centerDistance = length(fragment.xy - cell.center);

    // This may be optimized to round through the obstacles array once per fragment
    if (centerDistance <= cell.radius && !isPointBehindObstacles(fragment.xy)) {
        layerColor = cell.bodyRgba;

        if (
            centerDistance > cell.radius - CELL_BORDER_WIDTH ||
            nearestObstacleDistance(fragment.xy) <= CELL_BORDER_WIDTH
        ) {
            layerColor = borderColor;
        } else {
            if (centerDistance <= sqrt(cell.radius)) {
                layerColor = borderColor;
            }
        }
    }

    color = mix(background, vec4(layerColor.rgb, 1), layerColor.a);
}