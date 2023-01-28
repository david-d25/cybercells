import Updater from "@/game/world/updater/Updater";
import World from "@/game/world/World";
import UpdateContext from "@/game/world/updater/UpdateContext";

export default class ResetContextUpdater implements Updater {
    constructor(
        private world: World,
        private context: UpdateContext
    ) {}

    update(): void {
        this.context.cellsSpeedBuffer.clear();
        this.context.cellsAngularSpeedBuffer.clear();

        for (const cell of this.world.cells.values()) {
            this.context.cellsSpeedBuffer.set(cell.id, cell.speed);
            this.context.cellsAngularSpeedBuffer.set(cell.id, cell.angularSpeed);
        }
    }
}