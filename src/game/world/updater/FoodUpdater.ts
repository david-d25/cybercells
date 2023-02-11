import World from "@/game/world/World";
import Updater from "@/game/world/updater/Updater";
import Vector2 from "@/geom/Vector2";
import Food from "@/game/world/object/Food";

export default class FoodUpdater implements Updater {
    constructor(private world: World) {}

    private debt = 0;

    update(delta: number): void {
        this.updateFoodSpawning(delta);
        this.updateFoodLifecycle(delta);
    }

    private updateFoodSpawning(delta: number) {
        const worldSizeAwareRate = this.world.foodSpawnRate * this.world.width * this.world.height / 1000000;
        this.debt += worldSizeAwareRate * delta;
        const newFoodNumber = Math.floor(this.debt);
        for (let i = 0; i < newFoodNumber; i++)
            this.spawnFoodAtRandomPlace();
        this.debt -= newFoodNumber;
    }

    private updateFoodLifecycle(delta: number) {
        this.world.food.forEach(food => {
            food.mass -= this.world.foodMassLoss * delta;
            if (food.mass < this.world.minFoodMass)
                this.world.remove(food);
        })
    }

    private spawnFoodAtRandomPlace() {
        const center = new Vector2(Math.random() * this.world.width, Math.random() * this.world.height);
        const mass = 40 + Math.random() * 40;
        const food = new Food(center, mass);
        this.world.add(food);
    }
}