import Vector2 from "@/geom/Vector2";

export default class Camera {
    constructor(
        public center: Vector2,
        public height: number
    ) {}

    static createNull() {
        return new Camera(new Vector2(), 0);
    }
}