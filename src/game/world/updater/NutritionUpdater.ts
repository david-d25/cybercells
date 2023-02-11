import Updater from "@/game/world/updater/Updater";
import World from "@/game/world/World";
import Cell from "@/game/world/object/Cell";
import CellType from "@/game/CellType";
import Food from "@/game/world/object/Food";
import Geometry from "@/geom/Geometry";

export default class NutritionUpdater implements Updater {
    constructor (private world: World) {}

    update(delta: number): void {
        const newMassByCell: { [index: number]: number } = {};

        this.updateNutritionExchanges(newMassByCell, delta);
        this.world.cells.forEach(cell => this.updateCellNutrition(cell, newMassByCell, delta));

        this.world.cells.forEach(cell => cell.mass = newMassByCell[cell.id] || cell.mass)

        this.killStarvingCells();
    }

    private updateCellNutrition(cell: Cell, newMassByCell: { [index: number]: number }, delta: number) {
        const cellMaxFoodGain = this.world.maxNutritionGainSpeed * delta;

        const liveCost = this.calculateLiveCost(cell) * delta;
        newMassByCell[cell.id] = (newMassByCell[cell.id] || cell.mass) - liveCost;

        if (cell.genome.type == CellType.PHAGOCYTE) {
            let maxConsumableMass = Math.min(
                this.world.maxCellMass - newMassByCell[cell.id],
                cellMaxFoodGain - (cell.mass - newMassByCell[cell.id])
            );

            this.world.pointCast(cell.center, cell.radius).forEach(wo => {
                if (wo instanceof Food) {
                    const food = wo as Food;
                    const massToEat = Geometry.clamp(food.mass, 0, maxConsumableMass);
                    newMassByCell[cell.id] += massToEat;
                    food.mass -= massToEat;
                    maxConsumableMass -= massToEat;
                }
            });
        }
    }

    private updateNutritionExchanges(newMassByCell: { [index: number]: number }, delta: number) {
        const cellMaxFoodGain = this.world.maxNutritionGainSpeed * delta;
        this.world.cells.forEach(cell => {
            if (cell.connections.size == 0)
                return;

            cell.connections.forEach((connection, partnerId) => {
                if (partnerId <= cell.id)
                    return;

                const partner = this.world.cells.get(partnerId)!;
                const nutritionRatio = cell.mass / partner.mass;
                const targetNutritionRatio = cell.genome.nutritionPriority + partner.genome.nutritionPriority != 0
                    ? cell.genome.nutritionPriority / partner.genome.nutritionPriority
                    : 1.0
                const maxConsumableMass = Math.min(
                    this.world.maxCellMass - newMassByCell[cell.id],
                    cellMaxFoodGain - (cell.mass - newMassByCell[cell.id])
                );
                const maxPartnerConsumableMass = Math.min(
                    this.world.maxCellMass - partner.mass,
                    cellMaxFoodGain - (partner.mass - newMassByCell[partner.id])
                );
                // Positive -> nutrition moves to this cell, negative -> ...to partner cell
                const nutritionTransitionFactor = isFinite(targetNutritionRatio)
                    ? (targetNutritionRatio - nutritionRatio) / (targetNutritionRatio + nutritionRatio)
                    : Number.POSITIVE_INFINITY;
                const nutritionTransitionAmount = Geometry.clamp( // Can't exceed max nutrition gain speed
                    Geometry.clamp( // Can't get from other cell more that its mass
                        nutritionTransitionFactor * cellMaxFoodGain,
                        -cell.mass,
                        partner.mass
                    ),
                    -maxPartnerConsumableMass,
                    maxConsumableMass
                );
                newMassByCell[cell.id] = (newMassByCell[cell.id] || cell.mass) + nutritionTransitionAmount;
                newMassByCell[partner.id] = (newMassByCell[partner.id] || partner.mass) - nutritionTransitionAmount;
            })
        })
    }

    private killStarvingCells() {
        this.world.cells.forEach(cell => {
            if (cell.mass < this.world.minCellMass) {
                this.world.remove(cell);
                this.world.add(new Food(cell.center, Math.sqrt(cell.mass)));
            }
        });
    }

    private calculateLiveCost(cell: Cell) {
        return 0.0075 * cell.mass;
    }
}