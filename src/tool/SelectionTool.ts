import Tool from "@/tool/Tool";
import ToolsManager from "@/tool/ToolsManager";

export default class SelectionTool implements Tool {
    name = "Selection";
    icon = require("@public/icon/tool/selection.svg")
    enabled = true

    init(toolsManager: ToolsManager): void {

    }

    onSelect(): void {

    }

    onUnselect(): void {

    }
}