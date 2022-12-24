import CellType from "@/game/CellType";

export default class Genome {
    type: CellType = CellType.FLAGELLOCYTE
    cyanPigment: number = 0
    magentaPigment: number = 0
    yellowPigment: number = 0
    hardness: number = 0.6
    splitMass: number = 350
    splitAngle: number = 0
    child1Angle: number = 0
    child2Angle: number = 0
    stickOnSplit: boolean = false
    child1KeepConnections: boolean = true
    child2KeepConnections: boolean = true
    nutritionPriority: number = 0.5

    flagellumForce: number = 8

    children: [Genome, Genome] = [this, this]

    deepCopy = this.copyRecursive

    applyRadiation() {
        // TODO
    }

    static newSampleGenome(): Genome {
        const result = new Genome();
        result.type = CellType.FLAGELLOCYTE;
        [result.cyanPigment, result.magentaPigment, result.yellowPigment] = this.randomSaturatedCmyColor();
        return result
    }

    private static randomSaturatedCmyColor(): [number, number, number] {
        const cmy: [number, number, number] = [1, 0, Math.random()]
        for (let i = 0; i < cmy.length; i++) {
            const randomIndex = Math.floor(Math.random() * cmy.length);
            [cmy[i], cmy[randomIndex]] = [cmy[randomIndex], cmy[i]];
        }
        return cmy
    }

    private copyRecursive(copies: Map<Genome, Genome> = new Map().set(null, null)): Genome {
        const result = new Genome()
        result.type = this.type
        result.cyanPigment = this.cyanPigment
        result.magentaPigment = this.magentaPigment
        result.yellowPigment = this.yellowPigment
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