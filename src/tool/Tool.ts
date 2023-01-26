import ToolsManager from "@/tool/ToolsManager";

export default interface Tool {
    name: string
    icon: string
    enabled: boolean

    init(toolsManager: ToolsManager): void
    onSelect(): void
    onUnselect(): void
}