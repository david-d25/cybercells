export default class ColorUtil {
    static cmywToRgba(
        cyan: number,
        magenta: number,
        yellow: number,
        white: number
    ): [number, number, number, number] {
        const [r, g, b] = [1 - cyan, 1 - magenta, 1 - yellow].map(v => v + (1 - v)*white/2);
        const a = 1 - (1 - cyan) * (1 - magenta) * (1 - yellow) * (1 - white);
        return [r, g, b, a];
    }
}