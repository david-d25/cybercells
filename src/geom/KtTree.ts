import Aabb from "@/geom/Aabb";
import {HasAabb} from "@/geom/HasAabb";

export default class KtTree {
    static Node = class {
        constructor(
            public axis: Axis,
            public aabb: Aabb,
            public objects: Set<HasAabb> = new Set()
        ) {}

        left: Node | null = null
        right: Node | null = null
        splitLine: number = 0

        get final() {
            return this.left == null || this.right == null;
        }
    }
}

export enum Axis {
    X, Y
}