import Tool from "@/game/tool/Tool";
import ToolsManager from "@/game/tool/ToolsManager";

export default class AddCellTool implements Tool {
    private toolsManager: ToolsManager | null = null;

    init(toolsManager: ToolsManager) {
        this.toolsManager = toolsManager
    }

    onSelect() {

    }

    onUnselect() {

    }
}