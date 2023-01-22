import ShaderManager from "@/gl/ShaderManager";
import { mat4, vec2 } from 'gl-matrix';

import WorldState from "@/game/state/WorldState";

import commonVertexShaderSource from 'raw-loader!@/shaders/common.vert';
import backgroundFragmentShaderSource from 'raw-loader!@/shaders/background.frag';
import cellFragmentShaderSource from 'raw-loader!@/shaders/cell.frag';
import Vector2 from "@/geom/Vector2";

export default class WorldRenderer {
    private readonly startTime = Date.now()

    private readonly mainMesh: WebGLBuffer
    private readonly drawBufferTextureUv: WebGLBuffer
    private readonly framebuffer: WebGLFramebuffer | null

    private bufferTextureSize: Vector2 = new Vector2()
    private sourceBufferTexture: WebGLTexture | null = null
    private targetBufferTexture: WebGLTexture | null = null

    public config = {
        layers: {
            background: true,
            walls: true,
            cells: true
        }
    }

    private constructor(
        private shaderManager: ShaderManager,
        private backgroundShader: WebGLShader,
        private cellShader: WebGLShader,
        public worldState: WorldState | null = null
    ) {
        this.mainMesh = this.createMainMesh()
        this.drawBufferTextureUv = this.createDrawBufferTextureUv()
        this.framebuffer = shaderManager.gl.createFramebuffer()
        this.autoUpdateDrawBufferTexture()
    }

    static init(canvas: HTMLCanvasElement, worldState: WorldState | null = null): WorldRenderer {
        const shaderManager = ShaderManager.init(canvas);

        const backgroundShader = shaderManager.newShader(commonVertexShaderSource, backgroundFragmentShaderSource)
        const cellShader = shaderManager.newShader(commonVertexShaderSource, cellFragmentShaderSource)
        return new WorldRenderer(shaderManager, backgroundShader, cellShader, worldState)
    }

    render() {
        const gl = this.shaderManager.gl
        gl.clearColor(0, 0, 0, 0)
        gl.clearDepth(1)
        gl.enable(gl.DEPTH_TEST)
        gl.depthFunc(gl.LEQUAL)

        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)
        gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight)

        if (this.config.layers.background)
            this.renderBackground()
        if (this.config.layers.cells)
            this.renderCells()
    }

    /**
     * From world coordinates to screen coordinates
     */
    project(worldPoint: vec2): vec2 {
        const projection = this.buildCameraTransform()
        const inverted = mat4.invert(projection, projection)
        return vec2.transformMat4(vec2.create(), worldPoint, inverted)
    }

    /**
     * From screen coordinates to world coordinates
     */
    unproject(screenPoint: vec2): vec2 {
        return vec2.transformMat4(vec2.create(), screenPoint, this.buildCameraTransform())
    }

    destroy() {
        this.shaderManager.destroy();
    }

    private renderCells() {
        if (!this.worldState)
            return

        const gl = this.shaderManager.gl
        gl.useProgram(this.cellShader)

        const vertexAttributeLoc = gl.getAttribLocation(this.cellShader, 'vertexPosition')
        gl.bindBuffer(gl.ARRAY_BUFFER, this.mainMesh)
        gl.vertexAttribPointer(vertexAttributeLoc, 2, gl.FLOAT, false, 0, 0)
        gl.enableVertexAttribArray(vertexAttributeLoc)

        const viewMatrix = this.buildViewTransform()
        gl.uniformMatrix4fv(gl.getUniformLocation(this.cellShader, 'viewMatrix'), false, viewMatrix)
        gl.uniform1f(gl.getUniformLocation(this.cellShader, 'time'), (Date.now() - this.startTime)/1000)

        gl.uniform2f(gl.getUniformLocation(this.cellShader, 'imageSize'), this.bufferTextureSize.x, this.bufferTextureSize.y)

        for (const [index, cell] of this.worldState.cells) {
            const cellRgba = WorldRenderer.cellPigmentsToRgba(
                cell.genome.cyanPigment,
                cell.genome.magentaPigment,
                cell.genome.yellowPigment,
                cell.genome.whitePigment
            )

            gl.bindFramebuffer(gl.FRAMEBUFFER, this.framebuffer)
            gl.bindTexture(gl.TEXTURE_2D, this.sourceBufferTexture)
            gl.uniform1i(gl.getUniformLocation(this.cellShader, 'image'), 0)

            gl.uniform1i(gl.getUniformLocation(this.cellShader, 'cell.id'), cell.id);
            gl.uniform2f(gl.getUniformLocation(this.cellShader, 'cell.center'), cell.center.x, cell.center.y);
            gl.uniform2f(gl.getUniformLocation(this.cellShader, 'cell.speed'), cell.speed.x, cell.speed.y);
            gl.uniform1f(gl.getUniformLocation(this.cellShader, 'cell.mass'), cell.mass);
            gl.uniform1f(gl.getUniformLocation(this.cellShader, 'cell.angle'), cell.angle);
            gl.uniform1f(gl.getUniformLocation(this.cellShader, 'cell.radius'), cell.radius);
            gl.uniform4f(gl.getUniformLocation(this.cellShader, 'cell.bodyRgba'), ...cellRgba);

            if (index == this.worldState.cells.size - 1)
                this.setDrawToCanvas()
            else
                this.setDrawToBufferTexture()

            gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)

            this.swapBuffers()
        }
    }

    private renderBackground() {
        if (!this.worldState)
            return

        const gl = this.shaderManager.gl
        gl.useProgram(this.backgroundShader)

        const vertexAttributeLoc = gl.getAttribLocation(this.backgroundShader, 'vertexPosition')
        gl.bindBuffer(gl.ARRAY_BUFFER, this.mainMesh)
        gl.vertexAttribPointer(vertexAttributeLoc, 2, gl.FLOAT, false, 0, 0)
        gl.enableVertexAttribArray(vertexAttributeLoc)

        const textureCoordinateLoc = gl.getAttribLocation(this.backgroundShader, 'textureCoordinate')
        gl.enableVertexAttribArray(textureCoordinateLoc)
        gl.bindBuffer(gl.ARRAY_BUFFER, this.drawBufferTextureUv)
        gl.vertexAttribPointer(textureCoordinateLoc, 2, gl.FLOAT, false, 0, 0)

        const viewMatrix = this.buildViewTransform()
        gl.uniformMatrix4fv(gl.getUniformLocation(this.backgroundShader, 'viewMatrix'), false, viewMatrix)
        gl.uniform1f(gl.getUniformLocation(this.backgroundShader, 'time'), (Date.now() - this.startTime)/1000)
        gl.uniform2f(gl.getUniformLocation(this.backgroundShader, 'areaSize'), this.worldState.width, this.worldState.height)

        this.setDrawToBufferTexture()

        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)

        this.swapBuffers()
    }

    private buildCameraTransform(): mat4 {
        if (!this.worldState)
            throw new Error("Can't build camera transform: the world state is not set in renderer!")

        const canvasWidth = this.shaderManager.gl.canvas.width
        const canvasHeight = this.shaderManager.gl.canvas.height

        const result = mat4.create()
        const camera = this.worldState.camera
        const scale = camera.height/canvasHeight
        mat4.scale(result, result, [scale, scale, 1])
        mat4.translate(result, result, [camera.center.x/scale - canvasWidth/2, camera.center.y/scale - canvasHeight/2, 0])
        return result
    }

    private buildViewTransform(): mat4 {
        const canvasHeight = this.shaderManager.gl.canvas.height

        const result = this.buildCameraTransform()
        mat4.scale(result, result, [1, -1, 1])
        mat4.translate(result, result, [0, -canvasHeight, 0])
        return result
    }

    private autoUpdateDrawBufferTexture() {
        if (this.drawBufferTextureNeedsUpdate()) {
            const gl = this.shaderManager.gl

            gl.deleteTexture(this.sourceBufferTexture)
            gl.deleteTexture(this.targetBufferTexture)

            const width = this.shaderManager.gl.drawingBufferWidth
            const height = this.shaderManager.gl.drawingBufferHeight

            this.sourceBufferTexture = this.shaderManager.newTexture(width, height)
            this.targetBufferTexture = this.shaderManager.newTexture(width, height)

            this.bufferTextureSize = new Vector2(width, height)
        }
    }

    private drawBufferTextureNeedsUpdate(): boolean {
        return  this.bufferTextureSize.x != this.shaderManager.gl.drawingBufferWidth ||
                this.bufferTextureSize.y != this.shaderManager.gl.drawingBufferHeight
    }

    private setDrawToBufferTexture() {
        this.autoUpdateDrawBufferTexture()
        const gl = this.shaderManager.gl
        gl.bindFramebuffer(gl.FRAMEBUFFER, this.framebuffer);
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, this.targetBufferTexture, 0)
    }

    private setDrawToCanvas() {
        this.shaderManager.gl.bindFramebuffer(this.shaderManager.gl.FRAMEBUFFER, null);
    }

    private swapBuffers() {
        const swap = this.sourceBufferTexture
        this.sourceBufferTexture = this.targetBufferTexture
        this.targetBufferTexture = swap
    }

    private createDrawBufferTextureUv() {
        return this.shaderManager.newArrayBuffer([
            1.0,  1.0,
            0.0,  1.0,
            1.0,  0.0,
            0.0,  0.0,
        ])
    }

    private createMainMesh(): WebGLBuffer {
        return this.shaderManager.newArrayBuffer([
            1.0, 1.0,
            -1.0, 1.0,
            1.0, -1.0,
            -1.0, -1.0
        ])
    }

    private static cellPigmentsToRgba(
        cyan: number,
        magenta: number,
        yellow: number,
        white: number
    ): [number, number, number, number] {
        const [r, g, b] = [1 - cyan, 1 - magenta, 1 - yellow]; // todo use white
        const a = 1 - (1 - cyan) * (1 - magenta) * (1 - yellow) * (1 - white);
        return [r, g, b, a];
    }
}
