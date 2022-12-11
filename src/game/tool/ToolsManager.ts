import WorldMouseEvent from "@/game/event/WorldMouseEvent";
import Tool from "@/game/tool/Tool";
import WorldState from "@/game/state/WorldState";

export default class ToolsManager {
    constructor(
        tools: Tool[],
        world: WorldState
    ) {}

    dispatchEvent(event: WorldMouseEvent) {
        // TODO
    }
}