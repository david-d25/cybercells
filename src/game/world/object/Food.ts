import Vector2 from "@/geom/Vector2";
import {HasAabb} from "@/geom/HasAabb";
import Aabb from "@/geom/Aabb";

export default class Food implements WorldObject, HasAabb {
    static FOOD_DENSITY = 3

    id = -1

    constructor(
        public center: Vector2,
        public mass: number
    ) {}


    get radius() {
        return Math.sqrt(this.mass/Math.PI) / Food.FOOD_DENSITY
    }

    get aabb(): Aabb {
        const radius = this.radius;
        return [this.center.x - radius, this.center.y - radius, this.center.x + radius, this.center.y + radius];
    }
}