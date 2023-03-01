import Vector2 from "@/geom/Vector2";
import Food from "@/game/world/object/Food";
import Cell from "@/game/world/object/Cell";
import Wall from "@/game/world/object/Wall";
import Genome from "@/game/Genome";
import Camera from "@/game/Camera";
import Geometry from "@/geom/Geometry";
import CollisionSystem from "@/game/world/CollisionSystem";
import Aabb from "@/geom/Aabb";

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
    private cellCollisionSystem: CollisionSystem<Cell> = new CollisionSystem();
    private foodCollisionSystem: CollisionSystem<Food> = new CollisionSystem();
    private wallCollisionSystem: CollisionSystem<Wall> = new CollisionSystem();

    newId() {
        return this.idCounter++;
    }

    add(object: WorldObject) {
        if (object.id == -1)
            object.id = this.newId();

        if (object instanceof Cell)
            this.cells.set(object.id, object);
        if (object instanceof Food)
            this.food.set(object.id, object);
        if (object instanceof Wall)
            this.walls.set(object.id, object);
    }

    remove(object: WorldObject) {
        this.cells.delete(object.id);
        this.food.delete(object.id);
        this.walls.delete(object.id);

        if (object instanceof Cell) {
            for (const id of object.connections.keys()) {
                this.cells.get(id)?.connections.delete(object.id);
            }
        }
    }

    getLightIntensityAtPoint(point: Vector2) {
        // TODO in future
    }

    getRadiationIntensityAtPoint(point: Vector2) {
        // TODO in future
    }

    updateCollisionSystem() {
        this.cellCollisionSystem.buildSystem(this, this.cells.values());
        this.foodCollisionSystem.buildSystem(this, this.food.values());
        this.wallCollisionSystem.buildSystem(this, this.walls.values());
    }

    // TODO this is slow
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

    // TODO return intersection points
    circleCast(center: Vector2, radius: number): WorldObject[] {
        const result: WorldObject[] = [];
        const aabb: Aabb = [
            center.x - radius,
            center.y - radius,
            center.x + radius,
            center.y + radius
        ];

        for (const it of this.wallCollisionSystem.findPotentialCollisions(aabb)) {
            if (Geometry.findLineAndCircleIntersections(center, radius, it.a, it.b).length != 0)
                result.push(it);
        }

        for (const it of this.cellCollisionSystem.findPotentialCollisions(aabb)) {
            if (Geometry.findCirclesIntersections(center, radius, it.center, it.radius).length != 0)
                result.push(it);
        }

        for (const it of this.foodCollisionSystem.findPotentialCollisions(aabb)) {
            if (Geometry.findCirclesIntersections(center, radius, it.center, it.radius).length != 0)
                result.push(it);
        }

        return result;
    }

    // TODO return intersection points
    pointCast(point: Vector2, threshold: number): WorldObject[] {
        const result: WorldObject[] = [];
        const error = 10e-6;
        const aabb: Aabb = [
            point.x - threshold,
            point.y - threshold,
            point.x + threshold,
            point.y + threshold
        ];

        for (const it of this.wallCollisionSystem.findPotentialCollisions(aabb)) {
            const projected = Geometry.projectPointOntoLine(point, [it.a, it.b])
            if (point.distance(projected) <= threshold) {
                if (projected.distance(it.a) + projected.distance(it.b) <= it.a.distance(it.b) + threshold * 2 + error)
                    result.push(it);
            }
        }

        for (const it of this.cellCollisionSystem.findPotentialCollisions(aabb)) {
            if (it.center.distance(point) <= it.radius + threshold)
                result.push(it);
        }

        for (const it of this.foodCollisionSystem.findPotentialCollisions(aabb)) {
            if (it.center.distance(point) <= it.radius + threshold)
                result.push(it);
        }

        return result;
    }

    clear() {
        this.cells.forEach(this.remove.bind(this));
        this.food.forEach(this.remove.bind(this));
        this.walls.forEach(this.remove.bind(this));
    }

    static getDefault() {
        return new World(0, 0)
    }

    static TEMPORARY_DEBUG = (() => {
        const world = new World(800, 600);
        world.viscosity = 0.1;
        world.foodSpawnRate = 10;
        world.camera = new Camera(new Vector2(0, 0), 800)
        world.gravity = new Vector2(0, 0);
        for (let i = 0; i < 10; i++) {
            world.add(new Cell(new Vector2(50 + Math.random()*(world.width - 100), 50 + Math.random()*200), new Vector2(), 400, 0, 0, Genome.newSampleGenome()));
        }
        for (let i = 0; i < 10; i++) {
            world.add(new Food(new Vector2(50 + Math.random()*(world.width - 100), 50 + Math.random()*200), 50));
        }
        world.camera.center = new Vector2(400, 300);
        world.add(new Wall(new Vector2(0, 0), new Vector2(0, world.height)));
        world.add(new Wall(new Vector2(0, world.height), new Vector2(world.width, world.height)));
        world.add(new Wall(new Vector2(world.width, world.height), new Vector2(world.width, 0)));
        world.add(new Wall(new Vector2(world.width, 0), new Vector2(0, 0)));
        return world;
    })()
}

export class CollisionResult {
    constructor(
        public object: WorldObject,
        public points: Vector2[]
    ) {}
}