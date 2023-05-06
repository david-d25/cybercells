export type TransformMatrix = [number, number, number, number, number, number];

export function createTranslate(x: number, y: number): TransformMatrix {
    return [1, 0, 0, 1, x, y]
}

export function createScale(sx: number, sy: number): TransformMatrix {
    return [sx, 0, 0, sy, 0, 0]
}

export function multiplyMatrices(matrixA: TransformMatrix, matrixB: TransformMatrix): TransformMatrix {
    const   a1 = matrixA[0],
            b1 = matrixA[1],
            c1 = matrixA[2],
            d1 = matrixA[3],
            e1 = matrixA[4],
            f1 = matrixA[5];

    const   a2 = matrixB[0],
            b2 = matrixB[1],
            c2 = matrixB[2],
            d2 = matrixB[3],
            e2 = matrixB[4],
            f2 = matrixB[5];

    return [
        a1 * a2 + c1 * b2,
        b1 * a2 + d1 * b2,
        a1 * c2 + c1 * d2,
        b1 * c2 + d1 * d2,
        a1 * e2 + c1 * f2 + e1,
        b1 * e2 + d1 * f2 + f1
    ];
}

export function invertMatrix(matrix: TransformMatrix): TransformMatrix {
    const   a = matrix[0],
            b = matrix[1],
            c = matrix[2],
            d = matrix[3],
            e = matrix[4],
            f = matrix[5],
            det = a * d - b * c;

    if (det === 0) {
        throw Error("Matrix has zero determinant");
    }

    return [
        d / det,
        -b / det,
        -c / det,
        a / det,
        (c * f - d * e) / det,
        (b * e - a * f) / det
    ];
}

export function transformVector(vector: [number, number], matrix: TransformMatrix): [number, number] {
    const x = vector[0], y = vector[1];

    return [
        matrix[0] * x + matrix[2] * y + matrix[4],
        matrix[1] * x + matrix[3] * y + matrix[5]
    ]
}