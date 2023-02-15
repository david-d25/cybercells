/**
 * Represents an Axis-Aligned Bounding Box.
 */
type Aabb = [number, number, number, number];
export default Aabb;
// export default class Aabb {
//     constructor(public minX: number, public minY: number, public maxX: number, public maxY: number) {}
//
//     get center(): Vector2 {
//         return new Vector2((this.minX + this.maxX)/2, (this.minY + this.maxY)/2)
//     }
//
//     get width(): number {
//         return this.maxX - this.minX
//     }
//
//     get height(): number {
//         return this.maxY - this.minY
//     }
// }