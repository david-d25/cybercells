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

    public get radius() {
        return Math.sqrt(this.mass)
    }

    get aabb() {
        return new Aabb(this.center.minus(this.radius), this.center.plus(this.radius))
    }
}

export class CellConnectionState {
    constructor(public angle: number, public partnerId: number) {}
}