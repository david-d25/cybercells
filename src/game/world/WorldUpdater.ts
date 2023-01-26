import World from "@/game/world/World";

export default class WorldUpdater {
    constructor(
        private world: World
    ) {}

    public readonly SIMULATION_TICK_DELAY = 10;

    simulationSpeed = 1;

    private intervalId = -1;

    get simulationActive() {
        return this.intervalId != -1;
    }

    startSimulation() {
        if (!this.simulationActive)
            this.intervalId = setInterval(this.intervalRoutine, this.SIMULATION_TICK_DELAY);
    }

    pauseSimulation() {
        if (this.simulationActive)
            clearInterval(this.intervalId);
        this.intervalId = -1;
    }

    tick(count: number) {
        // todo
    }

    private intervalRoutine() {

    }

    // physics layers:
    // 1. cell physics
    // 2. cell nutrition
    // 3. cell action
    // 4. food
}