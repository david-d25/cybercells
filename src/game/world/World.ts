import Vector2 from "@/geom/Vector2";
import Food from "@/game/world/object/Food";
import Cell from "@/game/world/object/Cell";
import Wall from "@/game/world/object/Wall";
import Genome from "@/game/Genome";
import Camera from "@/game/Camera";

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
    }

    public getLightIntensityAtPoint(point: Vector2) {

    }

    public static getDefault() {
        return new World(0, 0, new Vector2(), 0, 0, 0, 0)
    }

    static TEMPORARY_DEBUG = (() => {
        const state = new World(800, 600, new Vector2(), 0, 0, 0, 0, new Camera(new Vector2(0, 0), 800))
        state.cells.set(0, new Cell(new Vector2(50, 50), new Vector2(), 400, 0, 0, Genome.newSampleGenome()))
        state.cells.set(1, new Cell(new Vector2(200, 120), new Vector2(), 400, 0, 0, Genome.newSampleGenome()))
        return state
    })()
}