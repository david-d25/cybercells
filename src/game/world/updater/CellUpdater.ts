import Updater from "@/game/world/updater/Updater";
import World from "@/game/world/World";
import Cell, {CellConnectionState} from "@/game/world/object/Cell";
import CellType from "@/game/CellType";
import Vector2 from "@/geom/Vector2";
import Food from "@/game/world/object/Food";

export default class CellUpdater implements Updater {
    constructor (private world: World) {}

    update(delta: number): void {
        this.world.cells.forEach(cell => {
            cell.age += delta;
            this.doTypeSpecificThings(cell, delta);

            if (cell.mass > cell.genome.splitMass)
                this.split(cell);

            if (cell.center.isNaN())
                throw Error("Cell id = " + cell.id + " has NaN position!");
        });
    }

    private doTypeSpecificThings(cell: Cell, delta: number) {
        if (cell.genome.type == CellType.FLAGELLOCYTE) {
            const targetSpeed = Vector2.unit(cell.angle).times(cell.genome.flagellumForce);
            const speedDiff = targetSpeed.minus(cell.speed);
            const force = Vector2.unit(cell.angle).times(Vector2.unit(cell.angle).dot(speedDiff)).times(delta);
            cell.applyImpulse(cell.center, force);
            cell.mass -= speedDiff.length * this.world.flagellocyteFlagellumForceCost * delta;

            cell.connections.forEach(c => {
                if (Math.abs(c.angle - Math.PI) < Math.PI/12) {
                    this.world.remove(cell); // Die if tail is blocked
                    this.world.add(new Food(cell.center, Math.sqrt(cell.mass)));
                }
            })
        }
    }

    private split(cell: Cell) {
        const splitNormal = cell.angle + cell.genome.splitAngle + Math.PI/2;
        const child1Center = cell.center.plus(Vector2.unit(splitNormal - Math.PI / 2));
        const child2Center = cell.center.plus(Vector2.unit(splitNormal + Math.PI / 2));
        const child1Angle = cell.angle + cell.genome.splitAngle + cell.genome.child1Angle;
        const child2Angle = cell.angle + cell.genome.splitAngle + cell.genome.child2Angle;
        const child1Genome = cell.genome.children[0].deepCopy();
        const child2Genome = cell.genome.children[1].deepCopy();
        child1Genome.applyRadiation(this.world, this.world.radiation);
        child2Genome.applyRadiation(this.world, this.world.radiation);
        const child1ConnectionAngle = (-cell.genome.child1Angle + 3 * Math.PI) % (2 * Math.PI);
        const child2ConnectionAngle = (-cell.genome.child2Angle + 2 * Math.PI) % (2 * Math.PI);
        const child1 = new Cell(child1Center, cell.speed, cell.mass / 2, child1Angle, 0, child1Genome);
        const child2 = new Cell(child2Center, cell.speed, cell.mass / 2, child2Angle, 0, child2Genome);

        this.world.add(child1);
        this.world.add(child2);

        if (cell.genome.stickOnSplit) {
            child1.connections.set(child2.id, new CellConnectionState(child1ConnectionAngle, child2.id));
            child2.connections.set(child1.id, new CellConnectionState(child2ConnectionAngle, child1.id));
        }

        const that = this;

        if (cell.genome.child1KeepConnections)
            processExistingConnections(child1);
        if (cell.genome.child2KeepConnections)
            processExistingConnections(child2);

        function processExistingConnections(child: Cell) {
            cell.connections.forEach(connection => {
                const thisIsFirstChild = child.id == child1.id;
                const partner = that.world.cells.get(connection.partnerId)!;
                const partnerSideConnection = partner.connections.get(cell.id)!;

                let connectionAngleRelative = cell.genome.splitAngle - connection.angle + Math.PI / 2;
                if (!thisIsFirstChild)
                    connectionAngleRelative += Math.PI;
                connectionAngleRelative %= (2 * Math.PI);

                const narrowRange = connectionAngleRelative >= Math.PI / 15 && connectionAngleRelative <= Math.PI - Math.PI / 15;
                const broadRange = connectionAngleRelative >= -Math.PI / 15 && connectionAngleRelative <= Math.PI + Math.PI / 15;
                const bothKeepConnections = cell.genome.child1KeepConnections && cell.genome.child2KeepConnections;

                const childGenomeAngle = thisIsFirstChild ? cell.genome.child1Angle : cell.genome.child2Angle;
                if (narrowRange || broadRange && !bothKeepConnections) { // Connect single
                    partner.connections.set(child.id, new CellConnectionState(partnerSideConnection.angle, child.id));
                    child.connections.set(partner.id, new CellConnectionState(
                        (connection.angle - cell.genome.splitAngle - childGenomeAngle + 2 * Math.PI) % (2 * Math.PI),
                        partner.id
                    ));
                } else if (broadRange) { // Connect both with angle shift
                    let childShift = Math.PI / 6;
                    if (!thisIsFirstChild)
                        childShift *= -1;
                    if (Math.abs(cell.genome.splitAngle - connection.angle + Math.PI/2) > Math.PI / 15)
                        childShift *= -1;
                    partner.connections.set(child.id, new CellConnectionState(
                        partnerSideConnection.angle + childShift,
                        child.id
                    ));
                    child.connections.set(partner.id, new CellConnectionState(
                        (connection.angle - cell.genome.splitAngle - childGenomeAngle + childShift + 2 * Math.PI) % (2 * Math.PI),
                        partner.id
                    ));
                }
            })
        }

        this.world.remove(cell);
    }
}