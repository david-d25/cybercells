import {HasAabb} from "@/geom/HasAabb";
import Aabb from "@/geom/Aabb";

export default class KdTree<T extends HasAabb> {
    root: Node<T> | null = null;
}

export class Node<T extends HasAabb> {
    constructor(
        public axis: Axis,
        public aabb: Aabb,
        public objects: Iterable<T> = new Set()
    ) {}

    childA: Node<T> | null = null
    childB: Node<T> | null = null
    splitLine: number = 0
}

export enum Axis {
    X, Y
}