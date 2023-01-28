import Vector2 from "@/geom/Vector2";

export default class UpdateContext {
    cellsSpeedBuffer = new Map<number, Vector2>();
    cellsAngularSpeedBuffer = new Map<number, number>();
}