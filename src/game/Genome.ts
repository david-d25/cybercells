import CellType from "@/game/CellType";

export default class Genome {
    private constructor(
        public type: CellType = CellType.FLAGELLOCYTE,
        public cyanPigment: number = 0,
        public magentaPigment: number = 0,
        public yellowPigment: number = 0,
        public whitePigment: number = 0,
        public hardness: number = 0,
        public splitMass: number = 0,
        public splitAngle: number = 0,
        public child1Angle: number = 0,
        public child2Angle: number = 0,
        public stickOnSplit: boolean = false,
        public child1KeepConnections: boolean = false,
        public child2KeepConnections: boolean = false,
        public nutritionPriority: number = 0,
    ) {}

    flagellumForce: number = 8;

    children: [Genome, Genome] = [this, this];

    deepCopy = this.copyRecursive

    applyRadiationLocally() {
        // TODO
    }

    static newNullGenome(): Genome {
        return new Genome();
    }

    static newSampleGenome(): Genome {
        const result = new Genome();
        result.type = CellType.FLAGELLOCYTE;
        result.hardness = 0.6;
        result.splitMass = 350;
        result.child1KeepConnections = true;
        result.child2KeepConnections = true;
        result.nutritionPriority = 1;
        [result.cyanPigment, result.magentaPigment, result.yellowPigment, result.whitePigment] = this.getRandomCellPigments();
        return result
    }

    private static getRandomCellPigments(): [number, number, number, number] {
        const cmyw: [number, number, number, number] = [
            Math.round(Math.random()/2*100)/100,
            Math.round(Math.random()*100)/100,
            0,
            0
        ];
        for (let i = 0; i < cmyw.length; i++) {
            const randomIndex = Math.floor(Math.random() * cmyw.length);
            [cmyw[i], cmyw[randomIndex]] = [cmyw[randomIndex], cmyw[i]];
        }
        return cmyw
    }

    private copyRecursive(copies: Map<Genome, Genome> = new Map().set(null, null)): Genome {
        const result = new Genome()
        result.type = this.type
        result.cyanPigment = this.cyanPigment
        result.magentaPigment = this.magentaPigment
        result.yellowPigment = this.yellowPigment
        result.whitePigment = this.whitePigment
        result.hardness = this.hardness
        result.splitMass = this.splitMass
        result.splitAngle = this.splitAngle
        result.child1Angle = this.child1Angle
        result.child2Angle = this.child2Angle
        result.stickOnSplit = this.stickOnSplit
        result.child1KeepConnections = this.child1KeepConnections
        result.child2KeepConnections = this.child2KeepConnections
        result.nutritionPriority = this.nutritionPriority
        result.flagellumForce = this.flagellumForce
        copies.set(this, result)

        result.children = [
            copies.has(this.children[0]) ? copies.get(this.children[0])! : this.children[0].copyRecursive(copies),
            copies.has(this.children[1]) ? copies.get(this.children[1])! : this.children[1].copyRecursive(copies)
        ]

        return result
    }

    private findAllGenomes(): Set<Genome> {
        const stash = new Array<Genome>()
        const result = new Set<Genome>()
        while (stash.length != 0) {
            stash.pop()!!.children.forEach((element: Genome) => {
                if (!result.has(element)) {
                    stash.push(element)
                    result.add(element)
                }
            });
        }
        return result
    }

    private applyRadiationRecursive() {
        // TODO
    }
}