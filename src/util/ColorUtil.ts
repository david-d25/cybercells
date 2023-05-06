import Genome from "@/game/Genome";

export type rgba = [number, number, number, number];
export type cmyw = [number, number, number, number];

export function cmywFromGenome(genome: Genome): cmyw {
    return [
        genome.cyanPigment,
        genome.magentaPigment,
        genome.yellowPigment,
        genome.whitePigment
    ]
}

export function cmywToRgba(color: cmyw): rgba {
    const [cyan, magenta, yellow, white] = color;
    const [r, g, b] = [1 - cyan, 1 - magenta, 1 - yellow].map(v => v + (1 - v)*white/2);
    const a = 1 - (1 - cyan) * (1 - magenta) * (1 - yellow) * (1 - white);
    return [r, g, b, a];
}

export function mixRgba(a: rgba, b: rgba): rgba {
    return [(a[0] + b[0])/2, (a[1] + b[1])/2, (a[2] + b[2])/2, (a[3] + b[3])/2];
}

export function darkenRgba(color: rgba, percent: number): rgba {
    const coefficient = 1 - percent;
    return [color[0] * coefficient, color[1] * coefficient, color[2] * coefficient, color[3]];
}

export function rgbaToCssString(color: rgba) {
    return `rgba(${Math.floor(color[0]*256)}, ${Math.floor(color[1]*256)}, ${Math.floor(color[2]*256)}, ${color[3]})`;
}