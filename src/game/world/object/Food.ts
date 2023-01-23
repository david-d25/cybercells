import Vector2 from "@/geom/Vector2";

export default class Food implements WorldObject {
    static FOOD_DENSITY = 4

    id = -1

    constructor(
        public center: Vector2,
        public mass: number
    ) {}


    get radius() {
        return Math.sqrt(this.mass/Math.PI) / Food.FOOD_DENSITY
    }
}