/**
 * Represents an Axis-Aligned Bounding Box.
 */
class Aabb {
    min: Vector2
    max: Vector2

    /**
     * @param min upper-left corner of the box
     * @param max lower-right corner of the box
     */
    constructor(min: Vector2, max: Vector2) {
        this.min = min
        this.max = max
    }

    get center(): Vector2 {
        return new Vector2((this.min.x + this.max.x)/2, (this.min.y + this.max.y)/2)
    }

    get width(): number {
        return this.max.x - this.min.x
    }

    get height(): number {
        return this.max.y - this.min.y
    }
}