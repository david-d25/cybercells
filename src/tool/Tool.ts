import ToolsManager from "@/tool/ToolsManager";
import World from "@/game/world/World";

export default interface Tool {
    name: string
    icon: string
    enabled: boolean

    init(toolsManager: ToolsManager, world: World): void
    onSelect(): void
    onUnselect(): void
}