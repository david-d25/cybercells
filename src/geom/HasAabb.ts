import Aabb from "@/geom/Aabb";

export interface HasAabb {
    get aabb(): Aabb
}