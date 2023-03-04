import Updater from "@/game/world/updater/Updater";
import World from "@/game/world/World";
import Cell, {CellConnectionState} from "@/game/world/object/Cell";
import Wall from "@/game/world/object/Wall";
import Vector2 from "@/geom/Vector2";
import Geometry from "@/geom/Geometry";
import UpdateContext from "@/game/world/updater/UpdateContext";

export default class KineticsUpdater implements Updater {
    private static CELL_STICKINESS_DEPTH = 3

    private cellsSpeedBuffer = new Map<number, Vector2>();
    private cellsAngularSpeedBuffer = new Map<number, number>();

    constructor(
        private world: World,
        private context: UpdateContext,
    ) {}

    update(delta: number): void {
        this.reset();

        for (const cell of this.world.cells.values()) {
            this.processGravity(cell, delta);

            this.world.pointCast(cell.center, cell.radius).forEach(wo => {
                if (wo instanceof Wall)
                    this.processCellWallCollision(cell, wo, delta);
                else if (wo instanceof Cell)
                    this.processCellsCollision(cell, wo, delta);
            })

            for (const connection of cell.connections.values())
                this.processCellConnection(cell, connection, delta);
        }

        this.apply();
    }
    
    private reset() {
        this.cellsSpeedBuffer.clear();
        this.cellsAngularSpeedBuffer.clear();

        for (const cell of this.world.cells.values()) {
            this.cellsSpeedBuffer.set(cell.id, cell.speed);
            this.cellsAngularSpeedBuffer.set(cell.id, cell.angularSpeed);
        }
    }

    private apply() {
        this.cellsSpeedBuffer.forEach((value, key) => {
            const cell = this.world.cells.get(key)
            if (cell) {
                cell.speed = value;
            }
        });
        this.cellsAngularSpeedBuffer.forEach((value, key) => {
            const cell = this.world.cells.get(key)
            if (cell) {
                cell.angularSpeed = value;
            }
        });
    }

    // TODO use less Vector2 functions to improve performance
    private processGravity(cell: Cell, delta: number) {
        let speed = this.cellsSpeedBuffer.get(cell.id)!;
        speed = speed.plus(this.world.gravity.times(delta));
        this.cellsSpeedBuffer.set(cell.id, speed);
    }

    // TODO use less Vector2 functions to improve performance
    // TODO cell can go through walls
    private processCellWallCollision(cell: Cell, wall: Wall, delta: number) {
        const intersections = Geometry.findLineAndCircleIntersections(cell.center, cell.radius, wall.a, wall.b);
        if (intersections.length !== 0) {
            const projection = Geometry.projectPointOntoLine(cell.center, [wall.a, wall.b]);
            const oppositeForce = projection.to(cell.center).unit.times(cell.radius - projection.distance(cell.center));
            const depth = Geometry.clamp(1 - cell.center.distance(projection) / cell.radius, 0, 1);
            const hardnessCoefficient = Geometry.clamp(2 * (1 - cell.genome.hardness) * (depth - 0.5) + 1, 0, 1);
            const oldSpeed = this.cellsSpeedBuffer.get(cell.id)!;
            let newSpeed = oldSpeed.plus(oppositeForce.times(hardnessCoefficient * delta));
            if (depth > 0.5) {
                const angle = cell.center.to(projection).angle - cell.speed.angle;
                const coefficient = Math.abs(angle) < Math.PI/4 ? Math.cos(angle) : 0;
                newSpeed = newSpeed.plus(projection.to(cell.center).unit.times(2 * cell.speed.length * coefficient));
            }
            this.cellsSpeedBuffer.set(cell.id, newSpeed);
        }
    }

    // TODO use less Vector2 functions to improve performance
    private processCellsCollision(cell: Cell, otherCell: Cell, delta: number) {
        if (cell.id == otherCell.id)
            return;

        const toOtherCellCenter = cell.center.to(otherCell.center)
        const centersDistance = toOtherCellCenter.length
        const radiusSum = cell.radius + otherCell.radius
        if (centersDistance <= cell.radius + otherCell.radius) {
            const toOtherCellDirection = toOtherCellCenter.unit
            const toNearestOtherCellSurfacePoint = toOtherCellCenter.minus(toOtherCellDirection.times(otherCell.radius));
            const toOtherCellSurfacePoint = toOtherCellDirection.times(cell.radius);
            const rawForce = toNearestOtherCellSurfacePoint.minus(toOtherCellSurfacePoint);
            const depth = (radiusSum - centersDistance)/radiusSum * 2;
            const hardnessAvg = (cell.genome.hardness + otherCell.genome.hardness)/2;
            const hardnessCoefficient = Geometry.clamp(2 * (1 - hardnessAvg) * (depth - 0.5) + 1, 0, 1);
            const thisCellForce = rawForce
                .times(hardnessCoefficient * otherCell.mass/(cell.mass + otherCell.mass));

            const oldSpeed = this.cellsSpeedBuffer.get(cell.id)!;
            const newSpeed = oldSpeed.plus(thisCellForce.times(delta));
            this.cellsSpeedBuffer.set(cell.id, newSpeed);
        }
    }

    // TODO use less Vector2 functions to improve performance
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

    // TODO use less Vector2 functions to improve performance
    private applyImpulse(cell: Cell, impulseOrigin: Vector2, impulseDirection: Vector2) {
        if (impulseDirection.length == 0)
            return;
        const originToCenterAngle = impulseOrigin.to(cell.center).angle;
        const directionRelativeAngle = originToCenterAngle - impulseDirection.angle;
        const impulseOriginDistance = cell.center.distance(impulseOrigin);
        const projectedDistance = Math.sin(directionRelativeAngle) * impulseOriginDistance;
        const translationImpactCoefficient = 1 / ((projectedDistance / cell.radius)**2 + 1);
        const rotationImpactCoefficient = 1 - translationImpactCoefficient;
        const oldSpeed = this.cellsSpeedBuffer.get(cell.id)!;
        const newSpeed = oldSpeed.plus(impulseDirection.times(translationImpactCoefficient));
        const oldAngularSpeed = this.cellsAngularSpeedBuffer.get(cell.id)!;
        const newAngularSpeed = oldAngularSpeed
            - Math.atan(impulseDirection.length / projectedDistance) * rotationImpactCoefficient;
        this.cellsSpeedBuffer.set(cell.id, newSpeed);
        this.cellsAngularSpeedBuffer.set(cell.id, newAngularSpeed);
    }
}