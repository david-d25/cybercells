import Vector2 from "@/geom/Vector2";
import Food from "@/game/world/object/Food";
import Cell from "@/game/world/object/Cell";
import Wall from "@/game/world/object/Wall";
import Genome from "@/game/Genome";
import Camera from "@/game/Camera";
import Geometry from "@/geom/Geometry";

export default class World {
    constructor(
        public width: number,
        public height: number,
    ) {}

    public food: Map<number, Food> = new Map()
    public cells: Map<number, Cell> = new Map()
    public walls: Map<number, Wall> = new Map()

    // For user
    public foodSpawnRate = 0;
    public lightIntensity = 0;
    public radiation = 0;
    public viscosity = 0;
    public density = 0;
    public gravity = new Vector2();
    public camera = Camera.createNull();

    // Not for user
    public maxNutritionGainSpeed = 56;
    public minCellMass = 80;
    public maxCellMass = 500;
    public foodMassLoss = 0.1;
    public minFoodMass = 0.1;

    // Cell-specific, not for user
    public flagellocyteFlagellumForceCost = 0.1;
    public flagellocyteFlagellumForceMax = 10;

    private idCounter = 0;

    public newId() {
        return this.idCounter++;
    }

    public add(object: WorldObject) {
        if (object.id == -1)
            object.id = this.newId();

        if (object instanceof Cell)
            this.cells.set(object.id, object);
        if (object instanceof Food)
            this.food.set(object.id, object);
        if (object instanceof Wall)
            this.walls.set(object.id, object);
    }

    public remove(object: WorldObject) {
        this.cells.delete(object.id);
        this.food.delete(object.id);
        this.walls.delete(object.id);

        if (object instanceof Cell) {
            for (const id of object.connections.keys()) {
                this.cells.get(id)?.connections.delete(object.id);
            }
        }
    }

    public getLightIntensityAtPoint(point: Vector2) {
        // TODO in future
    }

    public getRadiationIntensityAtPoint(point: Vector2) {
        // TODO in future
    }

    // TODO use K-d tree (maybe with a separate managing object)
    // TODO return intersection points
    rayCast(a: Vector2, b: Vector2): WorldObject[] {
        const result: WorldObject[] = [];

        for (const it of this.walls.values()) {
            if (Geometry.findLinesIntersection([it.a, it.b], [a, b]))
                result.push(it);
        }

        for (const it of this.cells.values()) {
            if (Geometry.findLineAndCircleIntersections(it.center, it.radius, a, b).length != 0)
                result.push(it);
        }

        for (const it of this.food.values()) {
            if (Geometry.findLineAndCircleIntersections(it.center, it.radius, a, b).length != 0)
                result.push(it);
        }

        return result;
    }

    // TODO use K-d Tree (maybe with a separate managing object)
    // TODO return intersection points
    circleCast(center: Vector2, radius: number): WorldObject[] {
        const result: WorldObject[] = [];

        for (const it of this.walls.values()) {
            if (Geometry.findLineAndCircleIntersections(center, radius, it.a, it.b).length != 0)
                result.push(it);
        }

        for (const it of this.cells.values()) {
            if (Geometry.findCirclesIntersections(center, radius, it.center, it.radius).length != 0)
                result.push(it);
        }

        for (const it of this.food.values()) {
            if (Geometry.findCirclesIntersections(center, radius, it.center, it.radius).length != 0)
                result.push(it);
        }

        return result;
    }

    // TODO use K-d Tree (maybe with a separate managing object)
    pointCast(point: Vector2, threshold: number): WorldObject[] {
        const result: WorldObject[] = [];
        const error = 10e-6;

        for (const it of this.walls.values()) {
            const projected = Geometry.projectPointOntoLine(point, [it.a, it.b])
            if (point.distance(projected) <= threshold) {
                if (projected.distance(it.a) + projected.distance(it.b) <= it.a.distance(it.b) + threshold * 2 + error)
                    result.push(it);
            }
        }

        for (const it of this.cells.values()) {
            if (it.center.distance(point) <= it.radius + threshold)
                result.push(it);
        }

        for (const it of this.food.values()) {
            if (it.center.distance(point) <= it.radius + threshold)
                result.push(it);
        }

        return result;
    }

    static getDefault() {
        return new World(0, 0)
    }

    static TEMPORARY_DEBUG = (() => {
        const world = new World(800, 600);
        world.viscosity = 0.2;
        world.camera = new Camera(new Vector2(0, 0), 800)
        world.gravity = new Vector2(0, 4);
        for (let i = 0; i < 50; i++) {
            world.add(new Cell(new Vector2(50 + Math.random()*(world.width - 100), 50 + Math.random()*200), new Vector2(), 400, 0, 0, Genome.newSampleGenome()));
        }
        world.camera.center = new Vector2(400, 300);
        world.add(new Wall(new Vector2(0, 0), new Vector2(0, world.height)));
        world.add(new Wall(new Vector2(0, world.height), new Vector2(world.width, world.height)));
        world.add(new Wall(new Vector2(world.width, world.height), new Vector2(world.width, 0)));
        world.add(new Wall(new Vector2(world.width, 0), new Vector2(0, 0)));
        return world;
    })()
}