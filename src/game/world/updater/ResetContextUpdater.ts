import Updater from "@/game/world/updater/Updater";
import World from "@/game/world/World";
import UpdateContext from "@/game/world/updater/UpdateContext";

export default class ResetContextUpdater implements Updater {
    constructor(
        private world: World,
        private context: UpdateContext
    ) {}

    update(): void {
        // Use this method to reset context variables
    }
}