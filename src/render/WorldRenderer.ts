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

    private drawBufferTextureSize: Vector2 = new Vector2()
    private drawBufferTexture: WebGLTexture | null = null

    private constructor(
        private shaderManager: ShaderManager,
        private backgroundShader: WebGLShader,
        private cellShader: WebGLShader,
        private worldState: WorldState
    ) {
        this.mainMesh = this.createMainMesh()
        this.drawBufferTextureUv = this.createDrawBufferTextureUv()
        this.framebuffer = shaderManager.gl.createFramebuffer()
        this.autoUpdateDrawBufferTexture()
    }

    static init(canvas: HTMLCanvasElement, worldState: WorldState): WorldRenderer {
        const shaderManager = ShaderManager.init(canvas);

        const backgroundShader = shaderManager.initShaderProgram(commonVertexShaderSource, backgroundFragmentShaderSource)
        const cellShader = shaderManager.initShaderProgram(commonVertexShaderSource, cellFragmentShaderSource)
        return new WorldRenderer(shaderManager, backgroundShader, cellShader, worldState)
    }

    render() {
        const gl = this.shaderManager.gl
        gl.clearColor(0, 0, 0, 1)
        gl.clearDepth(1)
        gl.enable(gl.DEPTH_TEST)
        gl.depthFunc(gl.LEQUAL)

        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)
        gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight)

        this.renderBackground()
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

    private renderCells() {
        const gl = this.shaderManager.gl
        gl.useProgram(this.cellShader)

        const vertexAttributeLoc = gl.getAttribLocation(this.cellShader, 'vertexPosition')
        gl.bindBuffer(gl.ARRAY_BUFFER, this.mainMesh)
        gl.vertexAttribPointer(vertexAttributeLoc, 2, gl.FLOAT, false, 0, 0)
        gl.enableVertexAttribArray(vertexAttributeLoc)

        const viewMatrix = this.buildViewTransform()
        gl.uniformMatrix4fv(gl.getUniformLocation(this.cellShader, 'viewMatrix'), false, viewMatrix)
        gl.uniform1f(gl.getUniformLocation(this.cellShader, 'time'), (Date.now() - this.startTime)/1000)

        gl.uniform2f(gl.getUniformLocation(this.cellShader, 'imageSize'), this.drawBufferTextureSize.x, this.drawBufferTextureSize.y)

        gl.bindFramebuffer(gl.FRAMEBUFFER, this.framebuffer)
        gl.bindTexture(gl.TEXTURE_2D, this.drawBufferTexture)
        gl.uniform1i(gl.getUniformLocation(this.cellShader, 'image'), 0)

        this.setDrawToCanvas()

        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)
    }

    private renderBackground() {
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

        this.setDrawToBufferTexture()

        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)
    }

    private buildCameraTransform(): mat4 {
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

            if (this.drawBufferTexture != null)
                gl.deleteTexture(this.drawBufferTexture)

            const texture = gl.createTexture()!;
            gl.bindTexture(gl.TEXTURE_2D, texture);

            gl.texImage2D(
                gl.TEXTURE_2D, 0, gl.RGBA,
                this.shaderManager.gl.drawingBufferWidth,
                this.shaderManager.gl.drawingBufferHeight,
                0, gl.RGBA, gl.UNSIGNED_BYTE, null
            );

            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

            this.drawBufferTextureSize = new Vector2(
                this.shaderManager.gl.drawingBufferWidth,
                this.shaderManager.gl.drawingBufferHeight
            )
            this.drawBufferTexture = texture
        }
    }

    private drawBufferTextureNeedsUpdate(): boolean {
        return  this.drawBufferTexture == null ||
                this.drawBufferTextureSize.x != this.shaderManager.gl.drawingBufferWidth ||
                this.drawBufferTextureSize.y != this.shaderManager.gl.drawingBufferHeight
    }

    private setDrawToBufferTexture() {
        this.autoUpdateDrawBufferTexture()
        const gl = this.shaderManager.gl
        gl.bindFramebuffer(gl.FRAMEBUFFER, this.framebuffer);
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, this.drawBufferTexture, 0)
    }

    private setDrawToCanvas() {
        this.shaderManager.gl.bindFramebuffer(this.shaderManager.gl.FRAMEBUFFER, null);
    }

    private createDrawBufferTextureUv() {
        return this.shaderManager.createArrayBuffer([
            1.0,  1.0,
            0.0,  1.0,
            1.0,  0.0,
            0.0,  0.0,
        ])
    }

    private createMainMesh(): WebGLBuffer {
        return this.shaderManager.createArrayBuffer([
            1.0, 1.0,
            -1.0, 1.0,
            1.0, -1.0,
            -1.0, -1.0
        ])
    }
}