import Genome from "@/game/Genome";

export default class GenomeLibrary {
    entries: Set<GenomeLibraryEntry> = new Set()

    search(query: string): Set<GenomeLibraryEntry> {
        const result = new Set<GenomeLibraryEntry>()
        this.entries.forEach( entry => {
            if (entry.name.toLowerCase().includes(query.toLowerCase()))
                result.add(entry)
        })
        return result
    }

    lookupByGenome(genome: Genome): GenomeLibraryEntry | null {
        for (const entry of this.entries) {
            if (entry.genome == genome)
                return entry;
        }
        return null;
    }
}

export class GenomeLibraryEntry {
    constructor(
        public name: string,
        public genome: Genome
    ) {}
}