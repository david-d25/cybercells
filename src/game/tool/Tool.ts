import ToolsManager from "@/game/tool/ToolsManager";

export default interface Tool {
    init(toolsManager: ToolsManager): void
    onSelect(): void
    onUnselect(): void
}