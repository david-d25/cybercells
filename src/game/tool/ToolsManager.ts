import WorldMouseEvent from "@/game/event/WorldMouseEvent";
import Tool from "@/game/tool/Tool";
import WorldState from "@/game/state/WorldState";

export default class ToolsManager {

    public currentTool: Tool

    constructor(
        public tools: Tool[],
        private world: WorldState
    ) {
        tools.forEach(tool => tool.init(this))
        this.currentTool = tools[0]
    }

    dispatchEvent(event: WorldMouseEvent) {
        // TODO
    }
}