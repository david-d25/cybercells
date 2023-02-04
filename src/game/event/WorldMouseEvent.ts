import World from "@/game/world/World";

export default class WorldMouseEvent {
    constructor(
        public world: World,
        public type: string,
        public screenX: number,
        public screenY: number,
        public worldX: number,
        public worldY: number
    ) {}
}