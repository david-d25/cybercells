import Tool from "@/game/tool/Tool";
import ToolsManager from "@/game/tool/ToolsManager";

export default class RemoveCellTool implements Tool {
    name = "Remove cell"
    icon = require("@public/icon/tool/remove-cell.svg")

    init(toolsManager: ToolsManager) {}

    onSelect() {}

    onUnselect() {}
}