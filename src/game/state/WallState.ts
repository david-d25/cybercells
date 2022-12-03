import Vector2 from "@/geom/Vector2";

export default class WallState implements WorldObject {
    id = -1

    constructor(public a: Vector2, public b: Vector2) {}
}
