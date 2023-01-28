import UpdateContext from "@/game/world/updater/UpdateContext";
import Updater from "@/game/world/updater/Updater";
import World from "@/game/world/World";

export default class ApplyContextUpdater implements Updater {
    constructor(
        private world: World,
        private context: UpdateContext
    ) {}

    update(): void {
        this.context.cellsSpeedBuffer.forEach((value, key) => {
            const cell = this.world.cells.get(key)
            if (cell) {
                cell.speed = value;
            }
        });
        this.context.cellsAngularSpeedBuffer.forEach((value, key) => {
            const cell = this.world.cells.get(key)
            if (cell) {
                cell.angularSpeed = value;
            }
        });
    }
}