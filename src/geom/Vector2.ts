const { sqrt, sin, cos, acos, PI } = Math

export default class Vector2 {
    x: number
    y: number

    constructor(x: number = 0, y: number = 0) {
        this.x = x
        this.y = y
    }

    get length(): number {
        return sqrt(this.x * this.x + this.y * this.y)
    }

    plus(rvalue: Vector2 | number): Vector2 {
        if (rvalue instanceof Vector2)
            return new Vector2(this.x + rvalue.x, this.y + rvalue.y)
        else
            return new Vector2(this.x + rvalue, this.y + rvalue)
    }

    minus(rvalue: Vector2 | number): Vector2 {
        if (rvalue instanceof Vector2)
            return new Vector2(this.x - rvalue.x, this.y - rvalue.y)
        else
            return new Vector2(this.x - rvalue, this.y - rvalue)
    }

    times(factor: Vector2 | number): Vector2 {
        if (factor instanceof Vector2)
            return new Vector2(this.x * factor.y, this.y * factor.y);
        else
            return new Vector2(this.x * factor, this.y * factor);
    }

    div(factor: Vector2 | number): Vector2 {
        if (factor instanceof Vector2)
            return new Vector2(this.x / factor.y, this.x / factor.y);
        else
            return new Vector2(this.x / factor, this.y / factor);
    }

    get negative(): Vector2 {
        return new Vector2(-this.x, -this.y)
    }

    dot(that: Vector2): number {
        return this.x * that.x + this.y * that.y
    }

    to(that: Vector2): Vector2 {
        return that.minus(this)
    }

    nearest(...vectors: Array<Vector2>): Vector2 {
        return vectors.reduce((a, b) => this.distance(a) > this.distance(b) ? b : a)
    }

    /**
     * This method calculates the shortest turn direction needed
     * to get from this vector's angle to that vector's angle.
     * 
     * @returns 1 if direction is counterclockwise, -1 otherwise
     */
    shortestAngularTurn(that: Vector2): number {
        const diff = that.angle - this.angle
        return (diff < -PI || diff >= 0.0 && diff < PI) ? 1 : -1
    }

    positiveAngleDiff(that: Vector2): number {
        return (this.angle - that.angle + 2*PI) % (2*PI)
    }

    get angle(): number {
        return -(this.y > 0 ? 2*PI - acos(this.x/this.length) : acos(this.x/this.length));
        // return (Math.atan2(-this.y, this.x) + 2 * Math.PI) % (2 * Math.PI);
    }

    get angleSafe(): number {
        return this.length != 0 ? this.angle : 0
    }

    distance(that: Vector2): number {
        return sqrt((this.x - that.x)**2 + (this.y - that.y)**2)
    }

    isNaN() {
        return isNaN(this.x) || isNaN(this.y);
    }

    /**
     * Returns a new vector rotated by given amount of radians.
     * The positive argument is counterclockwise rotation.
     */
    rotate(radians: number): Vector2 {
        return new Vector2(this.x * cos(radians) - this.y * sin(radians), this.x * sin(radians) + this.y * cos(radians))
    }

    get unit(): Vector2 {
        return this.length != 0 ? new Vector2(this.x/this.length, this.y/this.length) : new Vector2(1, 0)
    }

    static isNaN(vector: Vector2): boolean {
        return isNaN(vector.x) || isNaN(vector.y)
    }

    static unit(radians: number): Vector2 {
        return new Vector2(cos(radians), sin(radians))
    }

    static equals(a?: Vector2, b?: Vector2): boolean {
        if (a == null && b == null)
            return true
        if (a == null || b == null)
            return false
        return a.x == b.x && a.y == b.y
    }
}