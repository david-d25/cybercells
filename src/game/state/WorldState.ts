import Vector2 from "@/geom/Vector2";
import FoodState from "@/game/state/FoodState";
import CellState from "@/game/state/CellState";
import WallState from "@/game/state/WallState";
import Genome from "@/game/Genome";
import Camera from "@/game/Camera";

export default class WorldState {
    constructor(
        public width: number,
        public height: number,
        public gravity: Vector2,
        public viscosity: number,
        public radiation: number,
        public camera: Camera = Camera.NULL
    ) {}

    public food: Map<number, FoodState> = new Map()
    public cells: Map<number, CellState> = new Map()
    public walls: Map<number, WallState> = new Map()

    static NULL = new WorldState(0, 0, new Vector2(), 0, 0)

    static TEMPORARY_DEBUG = (() => {
        const state = new WorldState(800, 600, new Vector2(), 0, 0, new Camera(new Vector2(0, 0), 800))
        const genome = new Genome()
        state.cells.set(0, new CellState(new Vector2(50, 50), new Vector2(), 200, 0, 0, genome))
        return state
    })()
}