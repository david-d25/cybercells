import Vector2 from "@/geom/Vector2";

export default class Geometry {
    static findLineAndCircleIntersections(
        circleCenter: Vector2,
        circleRadius: number,
        lineStart: Vector2,
        lineEnd: Vector2
    ): Vector2[] {
        const x1 = lineStart.x;
        const y1 = lineStart.y;
        const x2 = lineEnd.x;
        const y2 = lineEnd.y;
        const xc = circleCenter.x;
        const yc = circleCenter.y;
        const vx = x2 - x1;
        const vy = y2 - y1;
        const sx = x1 - xc;
        const sy = y1 - yc;
        const a = vx * vx + vy * vy;
        const b = 2 * (vx * sx + vy * sy);
        const c = sx * sx + sy * sy - circleRadius * circleRadius;
        const d = b * b - 4 * a * c;

        if (d < 0) {
            return [];
        }

        const t1 = (-b - Math.sqrt(d)) / (2 * a);
        const t2 = (-b + Math.sqrt(d)) / (2 * a);

        const result = [];

        if (t1 >= 0 && t1 <= 1) {
            result.push(new Vector2(x1 + vx * t1, y1 + vy * t1));
        }

        if (t2 >= 0 && t2 <= 1) {
            result.push(new Vector2(x1 + vx * t2, y1 + vy * t2));
        }

        return result;
    }

    static findCirclesIntersections(
        circle1Center: Vector2,
        circle1Radius: number,
        circle2Center: Vector2,
        circle2Radius: number
    ): Vector2[] {
        const x1 = circle1Center.x;
        const y1 = circle1Center.y;
        const r1 = circle1Radius;
        const x2 = circle2Center.x;
        const y2 = circle2Center.y;
        const r2 = circle2Radius;

        const dx = x2 - x1;
        const dy = y2 - y1;
        const d = Math.sqrt(dx * dx + dy * dy);

        if (d > r1 + r2) {
            return [];
        }

        const a = (r1 * r1 - r2 * r2 + d * d) / (2 * d);
        const h = Math.sqrt(r1 * r1 - a * a);
        const x3 = x1 + (dx * a) / d;
        const y3 = y1 + (dy * a) / d;
        const xa = x3 + (h * dy) / d;
        const xb = x3 - (h * dy) / d;
        const ya = y3 - (h * dx) / d;
        const yb = y3 + (h * dx) / d;

        return [new Vector2(xa, ya), new Vector2(xb, yb)];
    }

    static findLinesIntersection(
        lineA: [Vector2, Vector2],
        lineB: [Vector2, Vector2]
    ): Vector2 | null {
        const lineAVector = lineA[0].to(lineA[1]);
        const lineBVector = lineB[0].to(lineB[1]);

        const angle1Ratio = lineAVector.y / lineAVector.x;
        const angle2Ratio = lineBVector.y / lineBVector.x;

        if (isNaN(angle1Ratio) || isNaN(angle2Ratio) ||
            !isFinite(angle1Ratio) && !isFinite(angle2Ratio) ||
            angle1Ratio == angle2Ratio)
            return null;

        if (!isFinite(angle1Ratio))
            return Geometry.findVerticalLineIntersection(lineA, lineB);
        if (!isFinite(angle2Ratio))
            return Geometry.findVerticalLineIntersection(lineB, lineA);

        const lineAOffset = lineA[0].y - angle1Ratio * lineA[0].x;
        const lineBOffset = lineB[0].y - angle2Ratio * lineB[0].x;

        const intersection = new Vector2((lineBOffset - lineAOffset) / (angle1Ratio - angle2Ratio), 0);
        intersection.y = angle1Ratio * intersection.x + lineAOffset;

        const v1 = lineA[0].to(intersection);
        const v2 = lineB[0].to(intersection);
        return (
            lineAVector.dot(v1) >= 0 &&
            lineAVector.dot(v1) <= lineAVector.dot(lineAVector) &&
            lineBVector.dot(v2) >= 0 &&
            lineBVector.dot(v2) <= lineBVector.dot(lineBVector)
        ) ? intersection : null;
    }

    static projectPointOntoLine(
        point: Vector2,
        line: [Vector2, Vector2]
    ): Vector2 {
        const a = line[0];
        const b = line[1];
        if (Math.abs(a.x - b.x) < Number.EPSILON)
            return new Vector2(a.x, point.y);
        return a.to(b).times(
            a.to(point).dot(a.to(b)) / (a.to(b)).dot(a.to(b))
        ).plus(a);
    }

    static clamp(value: number, min: number, max: number) {
        return Math.min(Math.max(value, min), max);
    }

    private static findVerticalLineIntersection(
        verticalLine: [Vector2, Vector2],
        otherLine: [Vector2, Vector2]
    ): Vector2 | null {
        if (otherLine[0].x == otherLine[1].x)
            return null;

        const otherAngleRatio = (otherLine[1].y - otherLine[0].y) / (otherLine[1].x - otherLine[0].x);
        const line2Offset = otherLine[0].y - otherAngleRatio * otherLine[0].x;
        const intersection = new Vector2(verticalLine[0].x, 0);
        intersection.y = otherAngleRatio * intersection.x + line2Offset;
        if (otherLine[0].x < intersection.x && otherLine[1].x < intersection.x ||
            otherLine[0].x > intersection.x && otherLine[1].x > intersection.x)
            return null;
        const avgY = (verticalLine[0].y + verticalLine[1].y) / 2;
        const height = Math.abs(verticalLine[0].y - verticalLine[1].y);
        return Math.abs(intersection.y - avgY) <= height/2 ? intersection : null;
    }
}