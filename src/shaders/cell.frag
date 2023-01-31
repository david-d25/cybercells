#version 300 es

precision highp float;
precision highp sampler2D;

const float POSITIVE_INFINITY = 1.0 / 0.0;
const float NAN = 0.0 / 0.0;

const float CELL_BORDER_WIDTH = 2.0;
const int MAX_NEIGHBOR_CELLS = 32;
const int MAX_WALLS = 32;

struct Cell {
    int id;
    vec2 center;
    vec2 speed;
    float mass;
    float angle;
    float radius;
    vec4 bodyRgba;
};

struct NeighborCell {
    vec2 center;
    float radius;
};

struct Obstacle {
    vec2 a;
    vec2 b;
};

struct CirclesIntersectionResult {
    bool intersection;
    vec2 a;
    vec2 b;
};

uniform sampler2D image;
uniform vec2 imageSize;
uniform mat4 viewMatrix;
uniform float time;

uniform Cell cell;

uniform NeighborCell neighbors[MAX_NEIGHBOR_CELLS];
uniform int neighborsSize;

uniform Obstacle walls[MAX_WALLS];
uniform int wallsSize;

in vec2 texel;
out vec4 color;

vec4 previousLayerColor(float x, float y) {
    vec2 imagePixelSize = vec2(1.0, 1.0) / imageSize;
    return texture(image, vec2(texel.x + x * imagePixelSize.x, texel.y + y * imagePixelSize.y));
}

vec2 projectPointOntoLine(vec2 p, vec2 lineStart, vec2 lineEnd) {
    vec2 a = lineStart;
    vec2 b = lineEnd;
    if (a == b)
        return a;
    return (b - a) * dot(p - a, b - a) / dot(b - a, b - a) + a;
}

CirclesIntersectionResult findCirclesIntersections(
    vec2 circle1Center,
    float circle1Radius,
    vec2 circle2Center,
    float circle2Radius
) {
    CirclesIntersectionResult result;
    float distance = length(circle1Center - circle2Center);

    if (distance > circle1Radius + circle2Radius) {
        result.intersection = false;
        return result;
    }

    vec2 a =    (circle1Center + circle2Center) / 2.0
                + (circle2Center - circle1Center) * (
                    pow(circle1Radius, 2.0) - pow(circle2Radius, 2.0)
                ) / 2.0 * pow(distance, 2.0);
    vec2 b =    vec2(circle2Center.y - circle1Center.y, circle1Center.x - circle2Center.x) * 0.5 * sqrt(
                    2.0 * (pow(circle1Radius, 2.0) + pow(circle2Radius, 2.0))
                    / pow(distance, 2.0) - pow(pow(circle1Radius, 2.0) - pow(circle2Radius, 2.0), 2.0)
                    / pow(distance, 4.0) - 1.0
                );

    if (any(isnan(a)) || any(isnan(b))) {
        result.intersection = false;
        return result;
    }

    result.a = a + b;
    result.b = a - b;
    result.intersection = true;

    return result;
}

vec2 findVerticalLineIntersection(vec2 verticalStart, vec2 verticalEnd, vec2 otherStart, vec2 otherEnd) {
    if (otherStart.x == otherEnd.x)
        return vec2(NAN);

    float otherAngleRatio = (otherEnd.y - otherStart.y) / (otherEnd.x - verticalStart.x);
    float otherOffset = verticalStart.y - otherAngleRatio * otherStart.x;
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
    float angle1Ratio = (line1End.y - line1Start.y) / (line1End.x - line1Start.x);
    float angle2Ratio = (line2End.y - line2Start.y) / (line2End.x - line2Start.x);

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

    vec2 avg1Point = (line1Start + line1End) / 2.0;
    vec2 line1Rect = vec2(
        abs(line1Start.x - line1End.x),
        abs(line1Start.y - line1End.y)
    );

    vec2 avg2Point = (line2Start + line2End) / 2.0;
    vec2 line2Rect = vec2(
        abs(line2Start.x - line2End.x),
        abs(line2Start.y - line2End.y)
    );

    return (
        abs(intersection.x - avg1Point.x) <= line1Rect.x/2.0 &&
        abs(intersection.y - avg1Point.y) <= line1Rect.y/2.0 &&
        abs(intersection.x - avg2Point.x) <= line2Rect.x/2.0 &&
        abs(intersection.y - avg2Point.y) <= line2Rect.y/2.0
    ) ? intersection : vec2(NAN);
}

float nearestObstacleDistance(vec2 p) {
    float result = POSITIVE_INFINITY;

    for (int i = 0; i < neighborsSize; i++) {
        NeighborCell neighbor = neighbors[i];
        CirclesIntersectionResult intersection = findCirclesIntersections(
        cell.center,
        cell.radius,
        neighbor.center,
        neighbor.radius
        );
        if (intersection.intersection) {
            vec2 projected = projectPointOntoLine(p, intersection.a, intersection.b);
            float fractionalDistance = length(projected - intersection.a) / length(intersection.b - intersection.a) * sign(dot(intersection.b - intersection.a, projected - intersection.a));
            if (fractionalDistance >= 0.0 && fractionalDistance < 1.0 && length(projected - p) < result)
            result = length(projected - p);
        }
    }

    for (int i = 0; i < wallsSize; i++) {
        Obstacle wall = walls[i];
        vec2 projected = projectPointOntoLine(p, wall.a, wall.b);
        float fractionalDistance = length(projected - wall.a) / length(wall.b - wall.a) * sign(dot(wall.b - wall.a, projected - wall.a));
        if (fractionalDistance >= 0.0 && fractionalDistance < 1.0 && length(projected - p) < result)
            result = length(projected - p);
    }

    return result;
}

bool isPointBehindLine(vec2 p, vec2 lineStart, vec2 lineEnd) {
    return !any(isnan(findLinesIntersections(cell.center, p, lineStart, lineEnd)));
}

bool isPointBehindObstacles(vec2 p) {
    for (int i = 0; i < neighborsSize; i++) {
        NeighborCell neighbor = neighbors[i];
        CirclesIntersectionResult intersection = findCirclesIntersections(
            cell.center,
            cell.radius,
            neighbor.center,
            neighbor.radius
        );
        if (intersection.intersection) {
            if (isPointBehindLine(p, intersection.a, intersection.b))
                return true;
        }
    }

    for (int i = 0; i < wallsSize; i++) {
        Obstacle wall = walls[i];
        if (isPointBehindLine(p, wall.a, wall.b))
            return true;
    }

    return false;
}

void main() {
    vec4 fragment = viewMatrix * gl_FragCoord;
    float x = fragment.x;
    float y = fragment.y;

    vec2 imagePixelSize = vec2(1.0, 1.0) / imageSize;

    vec4 background = texture(image, texel);
    vec4 layerColor = vec4(0);

    vec4 borderColor = mix(cell.bodyRgba, vec4(0, 0, 0, 1), 0.25);
    float centerDistance = sqrt(pow(x - cell.center.x, 2.0) + pow(y - cell.center.y, 2.0));

    if (centerDistance <= cell.radius && !isPointBehindObstacles(fragment.xy)) {
        layerColor = cell.bodyRgba;

        if (centerDistance > cell.radius - CELL_BORDER_WIDTH
            || nearestObstacleDistance(fragment.xy) <= CELL_BORDER_WIDTH)
            layerColor = borderColor;
    }

    color = mix(background, vec4(layerColor.rgb, 1), layerColor.a);
}