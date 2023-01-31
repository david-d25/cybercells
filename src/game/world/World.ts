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
        public gravity: Vector2,
        public density: number,
        public viscosity: number,
        public radiation: number,
        public lightIntensity: number,
        public camera: Camera = Camera.NULL
    ) {}

    public food: Map<number, Food> = new Map()
    public cells: Map<number, Cell> = new Map()
    public walls: Map<number, Wall> = new Map()

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

    initKdTree() {
        // TODO
    }

    dropKdTree() {
        // TODO
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

    static getDefault() {
        return new World(0, 0, new Vector2(), 0, 0, 0, 0)
    }

    static TEMPORARY_DEBUG = (() => {
        const world = new World(800, 600, new Vector2(0, 4), 0, 0.2, 0, 0, new Camera(new Vector2(0, 0), 800));
        for (let i = 0; i < 50; i++) {
            world.add(new Cell(new Vector2(50 + Math.random()*(world.width - 100), 50 + Math.random()*200), new Vector2(), 400, 0, 0, Genome.newSampleGenome()));
        }
        world.add(new Wall(new Vector2(0, 0), new Vector2(0, world.height)));
        world.add(new Wall(new Vector2(0, world.height), new Vector2(world.width, world.height)));
        world.add(new Wall(new Vector2(world.width, world.height), new Vector2(world.width, 0)));
        world.add(new Wall(new Vector2(world.width, 0), new Vector2(0, 0)));
        return world;
    })()
}