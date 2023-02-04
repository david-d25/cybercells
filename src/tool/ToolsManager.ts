import WorldMouseEvent from "@/game/event/WorldMouseEvent";
import Tool from "@/tool/Tool";
import World from "@/game/world/World";

export default class ToolsManager {

    private currentTool: Tool;
    private eventListeners: Map<Tool, Map<string, WorldEventListener>> = new Map();

    constructor(
        public tools: Tool[],
        private world: World
    ) {
        tools.forEach(tool => tool.init(this, world))
        this.currentTool = tools[0]
    }

    getSelectedTool() {
        return this.currentTool;
    }

    selectTool(tool: Tool) {
        if (tool == this.currentTool)
            return;
        this.currentTool.onUnselect();
        this.currentTool = tool;
        tool.onSelect();
    }

    addWorldEventListener(tool: Tool, eventType: string, handler: (event: WorldMouseEvent) => void) {
        const listener: WorldEventListener = { eventType, handler: handler.bind(tool) };
        if (!this.eventListeners.has(tool))
            this.eventListeners.set(tool, new Map());
        const toolListeners = this.eventListeners.get(tool)!;
        toolListeners.set(eventType, listener)
    }

    dispatchEvent(event: WorldMouseEvent) {
        const toolListeners = this.eventListeners.get(this.currentTool);
        if (!toolListeners)
            return;
        const listener = toolListeners.get(event.type);
        if (!listener)
            return;
        listener.handler(event);
    }
}

interface WorldEventListener {
    eventType: string,
    handler: (event: WorldMouseEvent) => any
}