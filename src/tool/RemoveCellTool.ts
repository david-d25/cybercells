import Tool from "@/tool/Tool";
import ToolsManager from "@/tool/ToolsManager";

export default class RemoveCellTool implements Tool {
    name = "Remove cell"
    icon = require("@public/icon/tool/remove-cell.svg")
    enabled = false

    init(toolsManager: ToolsManager) {}

    onSelect() {}

    onUnselect() {}
}