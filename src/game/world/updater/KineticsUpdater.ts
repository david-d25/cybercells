import Updater from "@/game/world/updater/Updater";
import World from "@/game/world/World";
import Cell, {CellConnectionState} from "@/game/world/object/Cell";
import Wall from "@/game/world/object/Wall";
import Vector2 from "@/geom/Vector2";
import Geometry from "@/geom/Geometry";
import UpdateContext from "@/game/world/updater/UpdateContext";

export default class KineticsUpdater implements Updater {
    private static CELL_STICKINESS_DEPTH = 3

    constructor(
        private world: World,
        private context: UpdateContext,
    ) {}

    update(delta: number): void {
        for (const cell of this.world.cells.values()) {
            
            this.processGravity(cell, delta);

            for (const wall of this.world.walls.values())
                this.processCellWallCollision(cell, wall, delta);

            for (const otherCell of this.world.cells.values())
                this.processCellsCollision(cell, otherCell, delta);

            for (const connection of cell.connections.values())
                this.processCellConnection(cell, connection, delta);
        }
    }

    private processGravity(cell: Cell, delta: number) {
        let speed = this.context.cellsSpeedBuffer.get(cell.id)!;
        speed = speed.plus(this.world.gravity.times(delta));
        this.context.cellsSpeedBuffer.set(cell.id, speed);
    }

    private processCellWallCollision(cell: Cell, wall: Wall, delta: number) {
        const intersections = Geometry.findLineAndCircleIntersections(cell.center, cell.radius, wall.a, wall.b);
        if (intersections.size !== 0) {
            const projection = Geometry.projectPointOntoLine(cell.center, [wall.a, wall.b]);
            const oppositeForce = projection.to(cell.center).unit.times(cell.radius - projection.distance(cell.center));
            const depth = Geometry.clamp(1 - cell.center.distance(projection) / cell.radius, 0, 1);
            const hardnessCoefficient = Math.pow(cell.genome.hardness * depth + 1, cell.genome.hardness + 1);
            const oldSpeed = this.context.cellsSpeedBuffer.get(cell.id)!;
            const newSpeed = oldSpeed.plus(oppositeForce.times(hardnessCoefficient).times(delta));
            this.context.cellsSpeedBuffer.set(cell.id, newSpeed);
        }
    }

    private processCellsCollision(cell: Cell, otherCell: Cell, delta: number) {
        if (cell.id == otherCell.id)
            return;

        if (cell.center.distance(otherCell.center) <= cell.radius + otherCell.radius) {
            const intersections = Geometry.findCirclesIntersections(
                cell.center, cell.radius, otherCell.center, otherCell.radius
            );

            const pivot = intersections.size != 0
                ? intersections.values().next().value.plus(intersections.values().next().value).div(2)
                : cell.center.plus(otherCell.center).div(2);

            const depth = Geometry.clamp(1 - cell.center.distance(pivot) / cell.radius, 0, 1);
            const massSum = cell.mass + otherCell.mass;
            const thisMassCoefficient = cell.mass / massSum;
            const oppositeForce = pivot.to(cell.center).unit.times(cell.radius - pivot.distance(cell.center));
            const hardnessCoefficient = Math.pow(cell.genome.hardness * depth + 1, cell.genome.hardness + 1);
            const oldSpeed = this.context.cellsSpeedBuffer.get(cell.id)!;
            const newSpeed = oldSpeed.plus(
                oppositeForce
                    .times(hardnessCoefficient)
                    .plus(
                        otherCell.speed
                            .times(thisMassCoefficient)
                            .minus(cell.speed.times(1 - thisMassCoefficient))
                            .times(cell.genome.hardness)
                    ).times(delta)
            );
            this.context.cellsSpeedBuffer.set(cell.id, newSpeed);
        }
    }

    private processCellConnection(cell: Cell, connection: CellConnectionState, delta: number) {
        const partner = this.world.cells.get(connection.partnerId);
        if (!partner)
            return;

        const partnerConnection = partner.connections.get(cell.id);
        if (!partnerConnection)
            return;

        // 4 is picked as balance between physical stability and computational load
        for (let stringId = 0; stringId < 4; stringId++) {
            const angleOffset = stringId * Math.PI / 24 - 1.5 * Math.PI / 24;
            const effectiveConnectionAngle = cell.angle + connection.angle + angleOffset;
            const effectiveConnectionForceOrigin = cell.center
                    .plus(Vector2.unit(effectiveConnectionAngle).times(cell.radius))
                    .minus(Vector2.unit(effectiveConnectionAngle).times(KineticsUpdater.CELL_STICKINESS_DEPTH));
            const effectiveConnectionForceDestination = partner.center
                .plus(Vector2.unit(partner.angle + partnerConnection.angle - angleOffset).times(partner.radius))
                .minus(
                    Vector2.unit(partner.angle + partnerConnection.angle - angleOffset)
                        .times(KineticsUpdater.CELL_STICKINESS_DEPTH)
                );
            const connectionForceDirection = effectiveConnectionForceOrigin
                .to(effectiveConnectionForceDestination)
                .div(4)
                .times(delta);
            this.applyImpulse(cell, effectiveConnectionForceOrigin, connectionForceDirection)
        }
    }

    private applyImpulse(cell: Cell, impulseOrigin: Vector2, impulseDirection: Vector2) {
        if (impulseDirection.length == 0)
            return;
        const originToCenterAngle = impulseOrigin.to(cell.center).angle;
        const directionRelativeAngle = originToCenterAngle - impulseDirection.angle;
        const impulseOriginDistance = cell.center.distance(impulseOrigin);
        const projectedDistance = Math.sin(directionRelativeAngle) * impulseOriginDistance;
        const translationImpactCoefficient = 1 / (Math.pow(projectedDistance / cell.radius, 2) + 1);
        const rotationImpactCoefficient = 1 - translationImpactCoefficient;
        const oldSpeed = this.context.cellsSpeedBuffer.get(cell.id)!;
        const newSpeed = oldSpeed.plus(impulseDirection.times(translationImpactCoefficient));
        const oldAngularSpeed = this.context.cellsAngularSpeedBuffer.get(cell.id)!;
        const newAngularSpeed = oldAngularSpeed
            - Math.atan(impulseDirection.length / projectedDistance) * rotationImpactCoefficient;
        this.context.cellsSpeedBuffer.set(cell.id, newSpeed);
        this.context.cellsAngularSpeedBuffer.set(cell.id, newAngularSpeed);
    }
}