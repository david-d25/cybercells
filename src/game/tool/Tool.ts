import ToolsManager from "@/game/tool/ToolsManager";

export default interface Tool {
    name: string
    icon: string

    init(toolsManager: ToolsManager): void
    onSelect(): void
    onUnselect(): void
}