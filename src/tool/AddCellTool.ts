import Tool from "@/tool/Tool";
import ToolsManager from "@/tool/ToolsManager";
import {GenomeLibraryEntry} from "@/game/GenomeLibrary";
import WorldMouseEvent from "@/game/event/WorldMouseEvent";
import Cell from "@/game/world/object/Cell";
import Vector2 from "@/geom/Vector2";

export default class AddCellTool implements Tool {
    name = "Add cell"
    icon = require("@public/icon/tool/add-cell.svg")
    enabled = true
    selectedGenomeEntry: GenomeLibraryEntry | null = null;

    init(toolsManager: ToolsManager) {
        toolsManager.addWorldEventListener(this, 'world-click', this.onClick);
    }

    onSelect() {}
    onUnselect() {}

    private onClick(event: WorldMouseEvent) {
        if (!this.selectedGenomeEntry ||
            event.worldX < 0 ||
            event.worldY < 0 ||
            event.worldX >= event.world.width ||
            event.worldY >= event.world.height
        ) return;

        const cell = new Cell(
            new Vector2(event.worldX, event.worldY),
            new Vector2(),
            400,
            0,
            0,
            this.selectedGenomeEntry.genome.deepCopy()
        );

        event.world.add(cell);
    }
}