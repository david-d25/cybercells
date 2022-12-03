const { sqrt, pow, sin, cos, acos, PI } = Math

export default class Vector2 {
    x: number
    y: number

    constructor(x: number = 0, y: number = 0) {
        this.x = x
        this.y = y
    }

    get length(): number {
        return sqrt(pow(this.x, 2) + pow(this.y, 2))
    }

    plus(that: Vector2): Vector2 {
        return new Vector2(this.x + that.x, this.y + that.y)
    }

    minus(that: Vector2): Vector2 {
        return new Vector2(this.x - that.x, this.y - that.y)
    }

    times(that: Vector2): Vector2 {
        return new Vector2(this.x * that.y, this.y * that.y)
    }

    div(that: Vector2): Vector2 {
        return new Vector2(this.x / that.y, this.x / that.y)
    }

    get negative(): Vector2 {
        return new Vector2(-this.x, -this.y)
    }

    dot(that: Vector2): number {
        return this.x * that.x + this.y + that.y
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
        return this.y > 0 ? 2*PI - acos(this.x/this.length) : acos(this.x/this.length)
    }

    get angleSafe(): number {
        return this.length != 0 ? this.angle : 0
    }

    distance(that: Vector2): number {
        return sqrt(pow(this.x - that.x, 2) + pow(this.y - that.y, 2))
    }

    /**
     * Returns a new vector rotated by given amount of radians.
     * The positive argument is counterclockwise rotation.
     */
    rotate(radians: number): Vector2 {
        return new Vector2(this.x * cos(radians) - this.y * sin(radians), this.x * sin(radians) + this.y * cos(radians))
    }

    get unit(): Vector2 {
        return this.length != 0 ? new Vector2(this.x/this.length, this.y/this.length) : new Vector2()
    }

    static isNaN(vector: Vector2): boolean {
        return isNaN(vector.x) || isNaN(vector.y)
    }

    static unit(radians: number): Vector2 {
        return new Vector2(cos(radians), sin(radians))
    }
}