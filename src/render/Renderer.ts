import {cmywFromGenome, cmywToRgba, darkenRgba, mixRgba, rgbaToCssString} from "@/util/ColorUtil";
import World from "@/game/world/World";
import {invertMatrix, TransformMatrix, transformVector} from "@/geom/TransformMatrix";
import Wall from "@/game/world/object/Wall";
import Cell from "@/game/world/object/Cell";
import Geometry from "@/geom/Geometry";
import Vector2 from "@/geom/Vector2";

export default class Renderer {
    private readonly startTime = Date.now()

    private readonly context: CanvasRenderingContext2D

    config = {
        layers: {
            background: true,
            walls: true,
            cells: true,
            food: true
        }
    };

    constructor(
        private canvas: HTMLCanvasElement,
        private world: World = World.getDefault()
    ) {
        this.context = canvas.getContext('2d')!;
    }

    render() {
        this.clearScene();
        this.context.save();
        this.applyCameraTransform();
        if (this.config.layers.background)
            this.renderBackground();
        if (this.config.layers.food)
            this.renderFood();
        if (this.config.layers.cells)
            this.renderCells();
        if (this.config.layers.walls)
            this.renderWalls();
        this.context.restore();
    }

    setWorld(world: World) {
        this.world = world;
    }

    /**
     * From world coordinates to screen coordinates.
     */
    project(worldPoint: [number, number]): [number, number] {
        return transformVector(worldPoint, this.buildCameraTransform())
    }

    /**
     * From screen coordinates to world coordinates.
     */
    unproject(screenPoint: [number, number]): [number, number] {
        const projection = this.buildCameraTransform()
        const inverted = invertMatrix(projection)
        return transformVector(screenPoint, inverted)
    }

    private clearScene() {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }

    private applyCameraTransform() {
        this.context.setTransform(...this.buildCameraTransform());
    }

    private renderFood() {
        const ctx = this.context;
        ctx.fillStyle = "rgb(168, 105, 33)";
        this.world.food.forEach(food => {
            ctx.beginPath();
            ctx.arc(food.center.x, food.center.y, food.radius, 0, 2*Math.PI);
            ctx.fill();
        });
    }

    private renderWalls() {
        const ctx = this.context;
        ctx.strokeStyle = "black";
        ctx.lineCap = "round";
        ctx.lineWidth = 2;
        ctx.beginPath();
        this.world.walls.forEach(wall => {
            ctx.moveTo(wall.a.x, wall.a.y);
            ctx.lineTo(wall.b.x, wall.b.y);
        });
        ctx.stroke();
    }

    private renderCells() {
        const ctx = this.context;

        this.world.cells.forEach(cell => {
            const aabb = cell.aabb; // TODO scale by 2 to handle the bigger visual AABB
            const [
                [aabbMinX, aabbMinY],
                [aabbMaxX, aabbMaxY]
            ] = [
                this.project([aabb[0], aabb[1]]),
                this.project([aabb[2], aabb[3]])
            ];
            if (aabbMaxX < 0 || aabbMaxY < 0
                || aabbMinX > this.canvas.width
                || aabbMinY > this.canvas.height
            ) return;

            const bodyRgba = cmywToRgba(cmywFromGenome(cell.genome));

            const borderRgba = darkenRgba(bodyRgba, 0.3);
            const nucleusRgba = borderRgba;

            const cellBorderWidth = 1.5;
            const fillRadius = cell.radius - cellBorderWidth;
            const strokeRadius = cell.radius - cellBorderWidth/2;

            const obstacles = this.calculateCellObstacles(cell);

            const fillGuidelines = obstacles.map(o => {
                const offset1 = new Vector2(o[0], o[1]).to(cell.center).unit.times(cellBorderWidth);
                const offset2 = new Vector2(o[2], o[3]).to(cell.center).unit.times(cellBorderWidth);
                return [o[0] + offset1.x, o[1] + offset1.y, o[2] + offset2.x, o[3] + offset2.y];
            });
            const strokeGuidelines = obstacles.map(o => {
                const offset1 = new Vector2(o[0], o[1]).to(cell.center).unit.times(cellBorderWidth / 2);
                const offset2 = new Vector2(o[2], o[3]).to(cell.center).unit.times(cellBorderWidth / 2);
                return [o[0] + offset1.x, o[1] + offset1.y, o[2] + offset2.x, o[3] + offset2.y];
            });

            ctx.fillStyle = rgbaToCssString(bodyRgba);
            ctx.beginPath();
            if (fillGuidelines.length == 0) {
                ctx.arc(cell.center.x, cell.center.y, fillRadius, 0, 2*Math.PI);
            } else {
                ctx.moveTo(fillGuidelines[0][0], fillGuidelines[0][1]);
                for (let i = 0; i < fillGuidelines.length; i++) {
                    const current = fillGuidelines[i];
                    const next = fillGuidelines[(i + 1) % fillGuidelines.length];
                    ctx.lineTo(current[2], current[3]);
                    if (current[2] != next[0] || current[3] != next[1]) {
                        const startAngle = cell.center.to(new Vector2(current[2], current[3])).angle
                        const endAngle = cell.center.to(new Vector2(next[0], next[1])).angle
                        ctx.arc(cell.center.x, cell.center.y, fillRadius, startAngle, endAngle);
                    }
                }
            }
            ctx.fill();

            ctx.strokeStyle = rgbaToCssString(borderRgba);
            ctx.lineCap = "round";
            ctx.lineWidth = cellBorderWidth;
            ctx.beginPath();
            if (strokeGuidelines.length == 0) {
                ctx.arc(cell.center.x, cell.center.y, strokeRadius, 0, 2*Math.PI);
            } else {
                ctx.moveTo(strokeGuidelines[0][0], strokeGuidelines[0][1]);
                for (let i = 0; i < strokeGuidelines.length; i++) {
                    const current = strokeGuidelines[i];
                    const next = strokeGuidelines[(i + 1) % strokeGuidelines.length];
                    ctx.lineTo(current[2], current[3]);
                    if (current[2] != next[0] || current[3] != next[1]) {
                        const startAngle = cell.center.to(new Vector2(current[2], current[3])).angle
                        const endAngle = cell.center.to(new Vector2(next[0], next[1])).angle
                        ctx.arc(cell.center.x, cell.center.y, strokeRadius, startAngle, endAngle);
                    }
                }
            }
            ctx.stroke();

            // Nucleus
            ctx.fillStyle = rgbaToCssString(nucleusRgba);
            ctx.beginPath();
            ctx.arc(cell.center.x, cell.center.y, Math.sqrt(cell.radius), 0, 2*Math.PI);
            ctx.fill();

            // // debug
            // for (let i = 0; i < obstacles.length; i++) {
            //     const o = obstacles[i];
            //     const offset1 = new Vector2(o[0], o[1]).to(cell.center).unit.times(cellBorderWidth / 2);
            //     const offset2 = new Vector2(o[2], o[3]).to(cell.center).unit.times(cellBorderWidth / 2);
            //     o[0] += offset1.x;
            //     o[1] += offset1.y;
            //     o[2] += offset2.x;
            //     o[3] += offset2.y;
            // }
            //
            // // debug
            // obstacles.forEach((o, i) => {
            //     ctx.beginPath();
            //     const offset = new Vector2((o[0] + o[2])/2, (o[1] + o[3])/2).to(cell.center).times(0.1);
            //     const [x1, y1, x2, y2] = [...o];
            //     const gradient = ctx.createLinearGradient(x1, y1, x2, y2);
            //     gradient.addColorStop(0, "red");
            //     gradient.addColorStop(1, "orange");
            //     ctx.strokeStyle = gradient;
            //     ctx.fillStyle = "black";
            //     ctx.font = "2px Arial";
            //     ctx.lineWidth = 0.2;
            //     ctx.moveTo(x1, y1);
            //     ctx.lineTo(x2, y2);
            //     ctx.textAlign = "center";
            //     ctx.textBaseline = "middle";
            //     ctx.stroke();
            //     ctx.fillText(i + '', (x1 + x2)/2 + offset.x, (y1 + y2)/2 + offset.y);
            // });
            // ctx.fillText('id' + cell.id, cell.center.x, cell.center.y);
        });

        this.world.cells.forEach(cell => this.renderCellConnections(cell));
    }

    private renderCellConnections(cell: Cell) {
        const ctx = this.context;
        cell.connections.forEach(connection => {
            const partnerId = connection.partnerId;
            if (partnerId < cell.id)
                return;

            const partner = this.world.cells.get(partnerId)!;
            const partnerConnection = partner.connections.get(cell.id)!;

            for (let stringId = 0; stringId < 4; stringId++) {
                const angleOffset = stringId * Math.PI / 24 - 1.5 * Math.PI / 24;
                const lineStart = cell.center.plus(Vector2.unit(cell.angle + connection.angle + angleOffset).times(cell.radius * 0.5));
                const lineEnd = partner.center.plus(Vector2.unit(partner.angle + partnerConnection.angle - angleOffset).times(partner.radius * 0.5));
                const gradient = ctx.createLinearGradient(lineStart.x, lineStart.y, lineEnd.x, lineEnd.y);
                const cellColor = darkenRgba(cmywToRgba(cmywFromGenome(cell.genome)), 0.3);
                const partnerColor = darkenRgba(cmywToRgba(cmywFromGenome(partner.genome)), 0.3);
                const connectionColor = darkenRgba(mixRgba(cellColor, partnerColor), 0.2);
                gradient.addColorStop(0, "transparent");
                gradient.addColorStop(0.5, rgbaToCssString(connectionColor));
                gradient.addColorStop(1, "transparent");
                ctx.fillStyle = gradient;

                const cellControlPointForward = cell.center.plus(Vector2.unit(cell.angle + connection.angle + angleOffset*2 + Math.PI/45).times(cell.radius * 0.7));
                const partnerControlPointForward = partner.center.plus(Vector2.unit(partner.angle + partnerConnection.angle - angleOffset*2 - Math.PI/45).times(partner.radius * 0.7));
                const cellControlPointBackward = cell.center.plus(Vector2.unit(cell.angle + connection.angle + angleOffset*2 - Math.PI/45).times(cell.radius * 0.7));
                const partnerControlPointBackward = partner.center.plus(Vector2.unit(partner.angle + partnerConnection.angle - angleOffset*2 + Math.PI/45).times(partner.radius * 0.7));

                ctx.beginPath();
                ctx.moveTo(lineStart.x, lineStart.y);
                ctx.bezierCurveTo(cellControlPointForward.x, cellControlPointForward.y, partnerControlPointForward.x, partnerControlPointForward.y, lineEnd.x, lineEnd.y);
                ctx.bezierCurveTo(partnerControlPointBackward.x, partnerControlPointBackward.y, cellControlPointBackward.x, cellControlPointBackward.y, lineStart.x, lineStart.y)
                ctx.fill();
            }
        });
    }

    private renderBackground() {
        const ctx = this.context;

        ctx.save();
        ctx.resetTransform();
        ctx.fillStyle = "rgb(36, 36, 36)";
        ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        ctx.restore();

        ctx.fillStyle = "rgb(51, 51, 51)";
        ctx.fillRect(0, 0, this.world.width, this.world.height);
    }

    private calculateCellObstacles(cell: Cell): [number, number, number, number][] {
        const obstaclesAngular: [number, number, number, number][] = [];
        const obstacles: [number, number, number, number][] = [];

        this.world.circleCast(cell.center, cell.radius).forEach(object => {
            if (object == cell)
                return;

            let intersections: Vector2[];
            if (object instanceof Wall) {
                intersections = Geometry.findLineAndCircleIntersections(cell.center, cell.radius, object.a, object.b);
                if (intersections.length == 1) {
                    const distanceA = cell.center.distance(object.a);
                    const distanceB = cell.center.distance(object.b);
                    intersections.push(distanceA < distanceB ? object.a : object.b);
                }
            } else if (object instanceof Cell)
                intersections = Geometry.findCirclesIntersections(
                    cell.center, cell.radius, object.center, object.radius
                );
            else return;

            if (intersections.length != 2)
                return;

            let [x1, y1, x2, y2] = [intersections[0].x, intersections[0].y, intersections[1].x, intersections[1].y];

            if (cell.center.to(new Vector2(x2, y2)).shortestAngularTurn(cell.center.to(new Vector2(x1, y1))) == 1)
                [x1, y1, x2, y2] = [x2, y2, x1, y1];

            const v1 = cell.center.to(new Vector2(x1, y1));
            const v2 = cell.center.to(new Vector2(x2, y2));
            let r1 = v1.length;
            let r2 = v2.length;

            if (r1 == 0 || r2 == 0)
                return;

            let a1 = v1.angle;
            let a2 = v2.angle;

            let newObstacleIndex = obstaclesAngular.length;
            for (let i = 0; i < obstaclesAngular.length; i++) {
                if (a1 <= obstaclesAngular[i][1]) {
                    newObstacleIndex = i;
                    break;
                }
            }

            // Merging intersecting obstacles
            for (let i = 0; obstacles.length > 0 && i < obstaclesAngular.length + 1; i++) {
                const opponent = obstacles[(i + obstacles.length) % obstacles.length];
                const opponentAngular = obstaclesAngular[(i + obstacles.length) % obstacles.length];

                const intersection = Geometry.findLinesIntersection(
                    [new Vector2(opponent[0], opponent[1]), new Vector2(opponent[2], opponent[3])],
                    [new Vector2(x1, y1), new Vector2(x2, y2)]
                );
                if (intersection) {
                    const intersectionRelative = cell.center.to(intersection);
                    const diff = opponentAngular[1] - a1
                    const shortestAngularTurn = (diff < -Math.PI || diff >= 0.0 && diff < Math.PI) ? 1 : -1
                    if (shortestAngularTurn == 1) {
                        x2 = intersection.x;
                        y2 = intersection.y;
                        a2 = intersectionRelative.angle;
                        r2 = intersectionRelative.length;
                        opponent[0] = intersection.x;
                        opponent[1] = intersection.y;
                        opponentAngular[0] = r2;
                        opponentAngular[1] = a2;
                    } else {
                        x1 = intersection.x;
                        y1 = intersection.y;
                        a1 = intersectionRelative.angle;
                        r1 = intersectionRelative.length;
                        opponent[2] = intersection.x;
                        opponent[3] = intersection.y;
                        opponentAngular[2] = r1;
                        opponentAngular[3] = a1;
                    }
                }
            }

            obstaclesAngular.splice(newObstacleIndex, 0, [r1, a1, r2, a2]);
            obstacles.splice(newObstacleIndex, 0, [x1, y1, x2, y2]);
        });

        // Removing redundant obstacles
        for (let i = 0; i < obstacles.length; i++) {
            const thisObstacle = obstacles[i];
            const thisObstacleAngular = obstaclesAngular[i];

            // Check against every other obstacle
            // If fully behind, remove
            // If partially behind, cut
            // If length is near 0, remove
            for (let j = 0; j < obstacles.length; j++) {
                if (i == j)
                    continue;
                const opponentObstacle = obstacles[j];
                const opponentObstacleAngular = obstaclesAngular[j];
                if (
                    Math.abs(thisObstacleAngular[3] - opponentObstacleAngular[1]) > 1e-8 &&
                    Geometry.shortestAngularTurn(thisObstacleAngular[1], opponentObstacleAngular[1]) >= 0 &&
                    Geometry.shortestAngularTurn(thisObstacleAngular[1], opponentObstacleAngular[3]) == 1 &&
                    Geometry.shortestAngularTurn(thisObstacleAngular[3], opponentObstacleAngular[1]) == -1
                ) {
                    const opponentIsFarther = Geometry.findLinesIntersection(
                        [cell.center, new Vector2(opponentObstacle[0], opponentObstacle[1])],
                        [new Vector2(thisObstacle[0], thisObstacle[1]), new Vector2(thisObstacle[2], thisObstacle[3])]
                    ) != null;

                    if (Geometry.shortestAngularTurn(thisObstacleAngular[3], opponentObstacleAngular[3]) == -1) {
                        // Full cover
                        if (opponentIsFarther) {
                            // Opponent is farther -> remove opponent
                            const indexToRemove = j;
                            if (indexToRemove <= i)
                                i--;
                            j--;
                            obstacles.splice(indexToRemove, 1);
                            obstaclesAngular.splice(indexToRemove, 1);
                        } else {
                            // Opponent is closer -> split this
                            // Not sure if this is going to work at all. If you have a lot of free time, you can test this
                            const splitPointA = Geometry.findLinesIntersection(
                                [cell.center, Vector2.unit(opponentObstacleAngular[1]).times(cell.radius)],
                                [new Vector2(thisObstacle[0], thisObstacle[1]), new Vector2(thisObstacle[2], thisObstacle[3])]
                            );
                            const splitPointB = Geometry.findLinesIntersection(
                                [cell.center, Vector2.unit(opponentObstacleAngular[3]).times(cell.radius)],
                                [new Vector2(thisObstacle[0], thisObstacle[1]), new Vector2(thisObstacle[2], thisObstacle[3])]
                            );
                            if (splitPointA == null || splitPointB == null)
                                break;
                            const newObstacle: [number, number, number, number] = [
                                splitPointB.x, splitPointB.y, thisObstacle[2], thisObstacle[3]
                            ];
                            const newObstacleAngular: [number, number, number, number] = [
                                cell.center.distance(splitPointB), opponentObstacleAngular[3], thisObstacleAngular[2], thisObstacleAngular[3]
                            ];
                            thisObstacle[2] = splitPointA.x;
                            thisObstacle[3] = splitPointA.y;
                            thisObstacleAngular[2] = cell.center.distance(splitPointA);
                            thisObstacleAngular[3] = opponentObstacleAngular[1];
                            const newObstacleIndex = j + 1;
                            obstacles.splice(newObstacleIndex, 0, newObstacle);
                            obstaclesAngular.splice(newObstacleIndex, 0, newObstacleAngular);
                            if (newObstacleIndex <= i)
                                i++;
                        }
                    } else {
                        // Partial cover
                        if (opponentIsFarther) {
                            // Opponent is father -> trim opponent
                            const newOpponentStart = Geometry.findLinesIntersection(
                                [cell.center, cell.center.plus(Vector2.unit(thisObstacleAngular[3]).times(cell.radius))],
                                [new Vector2(opponentObstacle[0], opponentObstacle[1]), new Vector2(opponentObstacle[2], opponentObstacle[3])]
                            );
                            if (newOpponentStart == null)
                                break;
                            opponentObstacle[0] = newOpponentStart.x;
                            opponentObstacle[1] = newOpponentStart.y;
                            opponentObstacleAngular[0] = cell.center.distance(newOpponentStart);
                            opponentObstacleAngular[1] = thisObstacleAngular[3];
                            if (new Vector2(opponentObstacle[0], opponentObstacle[1]).distance(new Vector2(opponentObstacle[2], opponentObstacle[3])) < 1e-6) {
                                if (j <= i)
                                    i--;
                                obstacles.splice(j, 1);
                                obstaclesAngular.splice(j, 1);
                                j--;
                            }
                        } else {
                            // Opponent is closer -> trim this
                            const newThisObstacleEnd = Geometry.findLinesIntersection(
                                [cell.center, cell.center.plus(Vector2.unit(opponentObstacleAngular[1]).times(cell.radius))],
                                [new Vector2(thisObstacle[0], thisObstacle[1]), new Vector2(thisObstacle[2], thisObstacle[3])]
                            );
                            if (newThisObstacleEnd == null)
                                break;
                            thisObstacle[2] = newThisObstacleEnd.x;
                            thisObstacle[3] = newThisObstacleEnd.y;
                            thisObstacleAngular[2] = cell.center.distance(newThisObstacleEnd);
                            thisObstacleAngular[3] = opponentObstacleAngular[1];
                            if (new Vector2(thisObstacle[0], thisObstacle[1]).distance(new Vector2(thisObstacle[2], thisObstacle[3])) < 1e-6) {
                                if (i <= j)
                                    j--;
                                obstacles.splice(i, 1);
                                obstaclesAngular.splice(i, 1);
                                i--;
                            }
                        }
                    }
                }
            }
        }

        return obstacles;
    }

    private buildCameraTransform(): TransformMatrix {
        const canvasWidth = this.canvas.width;
        const canvasHeight = this.canvas.height;

        const camera = this.world.camera;
        const scale = canvasHeight != 0 ? canvasHeight/camera.height : 1;
        return [
            scale,
            0,
            0,
            scale,
            -camera.center.x*scale + canvasWidth/2,
            -camera.center.y*scale + canvasHeight/2
        ];
    }
}
