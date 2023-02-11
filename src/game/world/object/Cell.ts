import Vector2 from "@/geom/Vector2";
import Genome from "@/game/Genome";
import {HasAabb} from "@/geom/HasAabb";
import Aabb from "@/geom/Aabb";

export default class Cell implements WorldObject, HasAabb {
    id = -1

    constructor(
        public center: Vector2,
        public speed: Vector2,
        public mass: number,
        public angle: number,
        public angularSpeed: number,
        public genome: Genome,
    ) {}

    connections: Map<number, CellConnectionState> = new Map()
    age: number = 0

    get radius() {
        return Math.sqrt(this.mass)
    }

    get aabb() {
        return new Aabb(this.center.minus(this.radius), this.center.plus(this.radius))
    }

    applyImpulse(impulseOrigin: Vector2, impulseDirection: Vector2) {
        if (impulseDirection.length == 0)
            return;
        const originToCenterAngle = impulseOrigin.to(this.center).angle;
        const directionRelativeAngle = originToCenterAngle - impulseDirection.angle;
        const impulseOriginDistance = this.center.distance(impulseOrigin);
        const projectedDistance = Math.sin(directionRelativeAngle) * impulseOriginDistance;
        const translationImpactCoefficient = 1 / (Math.pow(projectedDistance / this.radius, 2) + 1);
        const rotationImpactCoefficient = 1 - translationImpactCoefficient;
        this.speed = this.speed.plus(impulseDirection.times(translationImpactCoefficient));
        this.angularSpeed -= Math.atan(impulseDirection.length / projectedDistance) * rotationImpactCoefficient;
    }
}

export class CellConnectionState {
    constructor(public angle: number, public partnerId: number) {}
}