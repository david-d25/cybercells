import Updater from "@/game/world/updater/Updater";
import World from "@/game/world/World";

export default class PositionUpdater implements Updater {
    constructor(
        private world: World
    ) {}

    update(delta: number): void {
        this.world.cells.forEach(cell => {
            cell.center = cell.center.plus(cell.speed.times(delta));
            cell.angle += cell.angularSpeed * delta;
            cell.speed = cell.speed.minus(cell.speed.times(this.world.viscosity * delta));
            cell.angularSpeed -= cell.angularSpeed * this.world.viscosity * delta;
        });
        this.world.updateCollisionSystem();
    }
}