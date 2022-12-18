export default class WorldMouseEvent {
    constructor(
        public type: string,
        public screenX: number,
        public screenY: number,
        public worldX: number,
        public worldY: number
    ) {}
}