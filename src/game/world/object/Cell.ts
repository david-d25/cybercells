import Vector2 from "@/geom/Vector2";
import Genome from "@/game/Genome";

export default class Cell implements WorldObject {
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
}

export class CellConnectionState {
    constructor(public angle: number, public partnerId: number) {}
}