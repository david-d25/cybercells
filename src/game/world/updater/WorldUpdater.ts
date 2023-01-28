import World from "@/game/world/World";
import ResetContextUpdater from "@/game/world/updater/ResetContextUpdater";
import UpdateContext from "@/game/world/updater/UpdateContext";
import KineticsUpdater from "@/game/world/updater/KineticsUpdater";
import ApplyContextUpdater from "@/game/world/updater/ApplyContextUpdater";
import Updater from "@/game/world/updater/Updater";
import ApplyKineticsUpdater from "@/game/world/updater/ApplyKineticsUpdater";

export default class WorldUpdater {
    constructor(
        private world: World
    ) {
        this.updatePipeline = [
            new ResetContextUpdater(this.world, this.updateContext),
            new KineticsUpdater(this.world, this.updateContext),
            new ApplyContextUpdater(this.world, this.updateContext),
            new ApplyKineticsUpdater(this.world)
        ]
    }

    static readonly SIMULATION_TICK_FIXED_DELTA = 16;
    private readonly updateContext = new UpdateContext();
    private readonly updatePipeline: Updater[]

    simulationSpeed = 1;

    private intervalId = -1;
    private lastUpdateMillis = -1;

    get simulationActive() {
        return this.intervalId != -1;
    }

    startSimulation() {
        if (!this.simulationActive)
            this.intervalId = setInterval(
                this.intervalRoutine.bind(this),
                WorldUpdater.SIMULATION_TICK_FIXED_DELTA
            );
    }

    pauseSimulation() {
        if (this.simulationActive)
            clearInterval(this.intervalId);
        this.intervalId = -1;
    }

    tick(delta: number) {
        for (const updater of this.updatePipeline)
            updater.update(delta);
    }

    private intervalRoutine() {
        if (this.lastUpdateMillis == -1)
            this.lastUpdateMillis = Date.now();
        const deltaMillis = Date.now() - this.lastUpdateMillis;
        const ticksRequiredOriginal = Math.round(deltaMillis / WorldUpdater.SIMULATION_TICK_FIXED_DELTA);
        const ticksRequiredMultiplied = Math.min(
            Math.round(deltaMillis * this.simulationSpeed / WorldUpdater.SIMULATION_TICK_FIXED_DELTA),
            10
        );
        for (let i = 0; i < ticksRequiredMultiplied; i++)
            this.tick(WorldUpdater.SIMULATION_TICK_FIXED_DELTA/1000);
        this.lastUpdateMillis += WorldUpdater.SIMULATION_TICK_FIXED_DELTA * ticksRequiredOriginal;
    }

    // physics layers:
    // 1. cell physics
    // 2. cell nutrition
    // 3. cell action
    // 4. food
}