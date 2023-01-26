import Tool from "@/tool/Tool";
import ToolsManager from "@/tool/ToolsManager";

export default class AddCellTool implements Tool {
    name = "Add cell"
    icon = require("@public/icon/tool/add-cell.svg")
    enabled = false

    private toolsManager: ToolsManager | null = null;

    init(toolsManager: ToolsManager) {
        this.toolsManager = toolsManager
    }

    onSelect() {

    }

    onUnselect() {

    }
}