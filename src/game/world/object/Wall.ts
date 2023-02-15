import Vector2 from "@/geom/Vector2";
import {HasAabb} from "@/geom/HasAabb";
import Aabb from "@/geom/Aabb";

export default class Wall implements WorldObject, HasAabb {
    id = -1

    constructor(public a: Vector2, public b: Vector2) {}

    get aabb(): Aabb {
        return [this.a.x, this.a.y, this.b.x, this.b.y];
    }
}
