import WorldMouseEvent from "@/game/event/WorldMouseEvent";
import Tool from "@/tool/Tool";
import World from "@/game/world/World";

export default class ToolsManager {

    public currentTool: Tool

    constructor(
        public tools: Tool[],
        private world: World
    ) {
        tools.forEach(tool => tool.init(this))
        this.currentTool = tools[0]
    }

    dispatchEvent(event: WorldMouseEvent) {
        // TODO
    }
}