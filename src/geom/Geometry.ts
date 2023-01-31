import Vector2 from "@/geom/Vector2";

export default class Geometry {
    static findLineAndCircleIntersections(
        circleCenter: Vector2,
        circleRadius: number,
        lineStart: Vector2,
        lineEnd: Vector2
    ): Vector2[] {
        const v1 = lineEnd.minus(lineStart);
        const v2 = lineStart.minus(circleCenter);
        const b = -2 * v1.dot(v2);
        const c = 2 * (Math.pow(v1.x, 2) + Math.pow(v1.y, 2));
        const d = Math.sqrt(
            Math.pow(b, 2) - 2 * c * (Math.pow(v2.x, 2) + Math.pow(v2.y, 2) - Math.pow(circleRadius, 2))
        );
        if (isNaN(d))
            return [];

        const u1 = (b - d) / c;
        const u2 = (b + d) / c;
        const result = [];
        if (u1 >= 0 && u1 <= 1)
            result.push(new Vector2(lineStart.x + v1.x * u1, lineStart.y + v1.y * u1));
        if (u2 >= 0 && u2 <= 1)
            result.push(new Vector2(lineStart.x + v1.x * u2, lineStart.y + v1.y * u2));
        return result;
    }

    static findCirclesIntersections(
        circle1Center: Vector2,
        circle1Radius: number,
        circle2Center: Vector2,
        circle2Radius: number
    ): Vector2[] {
        const distance = circle1Center.distance(circle2Center)
        if (distance > circle1Radius + circle2Radius)
            return [];

        const a = circle1Center
            .plus(circle2Center)
            .times(0.5)
            .plus(
                circle2Center
                    .minus(circle1Center)
                    .times(
                        Math.pow(circle1Radius, 2) - Math.pow(circle2Radius, 2)
                    )
                    .div(2*Math.pow(distance, 2))
            );

        const b = new Vector2(
            circle2Center.y - circle1Center.y,
            circle1Center.x - circle2Center.x
        ).times(
            0.5 * Math.sqrt(
                2 * (Math.pow(circle1Radius, 2) + Math.pow(circle2Radius, 2)) / Math.pow(distance, 2) -
                Math.pow(Math.pow(circle1Radius, 2) - Math.pow(circle2Radius, 2), 2) / Math.pow(distance, 4) - 1
            )
        );

        if (a.isNaN() || b.isNaN())
            return [];

        return [a.plus(b), a.minus(b)];
    }

    static findLinesIntersection(
        lineA: [Vector2, Vector2],
        lineB: [Vector2, Vector2]
    ): Vector2 | null {
        const angle1Ratio = (lineA[1].y - lineA[0].y) / (lineA[1].x - lineA[0].x);
        const angle2Ratio = (lineB[1].y - lineB[0].y) / (lineB[1].x - lineB[0].x);

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

        const avgAPoint = lineA[0].plus(lineA[1]).div(2);
        const lineARect = new Vector2(
            Math.abs(lineA[0].x - lineA[1].x),
            Math.abs(lineA[0].y - lineA[1].y)
        );
        const avgBPoint = lineB[0].plus(lineB[1]).div(2);
        const lineBRect = new Vector2(
            Math.abs(lineB[0].x - lineB[1].x),
            Math.abs(lineB[0].y - lineB[1].y)
        );
        return (
            Math.abs(intersection.x - avgAPoint.x) <= lineARect.x/2 &&
            Math.abs(intersection.y - avgAPoint.y) <= lineARect.y/2 &&
            Math.abs(intersection.x - avgBPoint.x) <= lineBRect.x/2 &&
            Math.abs(intersection.y - avgBPoint.y) <= lineBRect.y/2
        ) ? intersection : null;
    }

    static projectPointOntoLine(
        point: Vector2,
        line: [Vector2, Vector2]
    ): Vector2 {
        const a = line[0];
        const b = line[1];
        if (a.x == b.x)
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