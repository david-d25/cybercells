import Updater from "@/game/world/updater/Updater";
import World from "@/game/world/World";

export default class ApplyKineticsUpdater implements Updater {
    constructor(
        private world: World
    ) {}

    update(delta: number): void {
        this.world.cells.forEach(cell => {
            cell.center = cell.center.plus(cell.speed.times(delta));
            cell.angle = cell.angle + cell.angularSpeed * delta;
        });
    }
}