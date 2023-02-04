import Tool from "@/tool/Tool";
import ToolsManager from "@/tool/ToolsManager";
import WorldMouseEvent from "@/game/event/WorldMouseEvent";
import Vector2 from "@/geom/Vector2";
import Cell from "@/game/world/object/Cell";

export default class RemoveCellTool implements Tool {
    name = "Remove cell"
    icon = require("@public/icon/tool/remove-cell.svg")
    enabled = true

    init(toolsManager: ToolsManager) {
        toolsManager.addWorldEventListener(this, 'world-click', this.onClick);
    }

    onSelect() {}

    onUnselect() {}

    private onClick(event: WorldMouseEvent) {
        const point = new Vector2(event.worldX, event.worldY)
        const hits = event.world.pointCast(point, 1);
        let target: Cell | null = null
        let distance = 0
        hits.filter(hit => hit instanceof Cell).forEach(hit => {
            const cell = hit as Cell;
            const thisCellDistance = point.distance(cell.center)
            if (target == null || thisCellDistance < distance) {
                target = cell;
                distance = thisCellDistance;
            }
        })
        if (target) {
            event.world.remove(target);
        }
    }
}