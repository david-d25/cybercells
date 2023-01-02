import Tool from "@/game/tool/Tool";
import ToolsManager from "@/game/tool/ToolsManager";

export default class SelectionTool implements Tool {
    name = "Selection";
    icon = require("@public/icon/tool/selection.svg")

    init(toolsManager: ToolsManager): void {

    }

    onSelect(): void {

    }

    onUnselect(): void {

    }
}