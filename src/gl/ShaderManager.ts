export default class ShaderManager {
    private constructor(
        public readonly gl: WebGL2RenderingContext
    ) {}

    static init(canvas: HTMLCanvasElement): ShaderManager {
        const gl = canvas.getContext('webgl2', {
            powerPreference: 'high-performance'
        })

        if (gl == null)
            throw new Error("Unable to initialize WebGL!")

        return new ShaderManager(gl)
    }

    newShader(vertexShaderSource: string, fragmentShaderSource: string): WebGLProgram {
        const vertexShader = this.loadShader(this.gl.VERTEX_SHADER, vertexShaderSource)
        const fragmentShader = this.loadShader(this.gl.FRAGMENT_SHADER, fragmentShaderSource)

        const shaderProgram = this.gl.createProgram()!
        this.gl.attachShader(shaderProgram, vertexShader)
        this.gl.attachShader(shaderProgram, fragmentShader)
        this.gl.linkProgram(shaderProgram)

        if (!this.gl.getProgramParameter(shaderProgram, this.gl.LINK_STATUS)) {
            throw new Error(`Couldn't link shaders! Logs:\n${this.gl.getProgramInfoLog(shaderProgram)}`)
        }

        return shaderProgram
    }

    newTexture(width: number, height: number): WebGLTexture | null {
        const texture = this.gl.createTexture();
        this.gl.bindTexture(this.gl.TEXTURE_2D, texture);
        this.gl.texImage2D(
            this.gl.TEXTURE_2D, 0, this.gl.RGBA, width, height,
            0, this.gl.RGBA, this.gl.UNSIGNED_BYTE, null
        );
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_S, this.gl.CLAMP_TO_EDGE);
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_T, this.gl.CLAMP_TO_EDGE);
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.NEAREST);
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, this.gl.NEAREST);
        return texture
    }

    newArrayBuffer(data: number[]): WebGLBuffer {
        const buffer = this.gl.createBuffer()
        if (buffer == null)
            throw new Error("Could not create buffer")
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, buffer)
        this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(data), this.gl.STATIC_DRAW)
        return buffer
    }

    private loadShader(type: number, source: string): WebGLShader {
        const shader = this.gl.createShader(type)!
        this.gl.shaderSource(shader, source)
        this.gl.compileShader(shader)

        if (!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {
            throw new Error(`Couldn't compile shaders! Logs:\n\n${this.gl.getShaderInfoLog(shader)}`)
        }

        return shader
    }
}