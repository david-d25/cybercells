import ShaderManager from "@/gl/ShaderManager";
import { mat4, vec2 } from 'gl-matrix';

import fragmentShaderSource from 'raw-loader!@/shaders/background.frag';
import vertexShaderSource from 'raw-loader!@/shaders/background.vert';
import WorldState from "@/game/state/WorldState";

export default class WorldRenderer {
    private readonly startTime = Date.now()
    private readonly mainMeshBuffer: WebGLBuffer

    private constructor(
        private shaderManager: ShaderManager,
        private shaderProgram: WebGLShader,
        private worldState: WorldState
    ) {
        this.mainMeshBuffer = this.createMainMesh()
    }

    static init(canvas: HTMLCanvasElement, worldState: WorldState): WorldRenderer {
        const shaderManager = ShaderManager.init(canvas);

        const shaderProgram = shaderManager.initShaderProgram(vertexShaderSource, fragmentShaderSource)!!
        return new WorldRenderer(shaderManager, shaderProgram, worldState);
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
    }

    // From world coordinates to screen coordinates
    project(worldPoint: vec2): vec2 {
        const projection = this.buildCameraTransform()
        const inverted = mat4.invert(projection, projection)
        return vec2.transformMat4(vec2.create(), worldPoint, inverted)
    }

    // From screen coordinates to world coordinates
    unproject(screenPoint: vec2): vec2 {
        return vec2.transformMat4(vec2.create(), screenPoint, this.buildCameraTransform())
    }

    private renderBackground() {
        const gl = this.shaderManager.gl
        gl.useProgram(this.shaderProgram)

        const vertexAttributeLoc = gl.getAttribLocation(this.shaderProgram, 'vertexPosition')
        gl.bindBuffer(gl.ARRAY_BUFFER, this.mainMeshBuffer)
        gl.vertexAttribPointer(vertexAttributeLoc, 2, gl.FLOAT, false, 0, 0)
        gl.enableVertexAttribArray(vertexAttributeLoc)

        const viewMatrix = this.buildViewTransform()
        gl.uniformMatrix4fv(gl.getUniformLocation(this.shaderProgram, 'viewMatrix'), false, viewMatrix)
        gl.uniform1f(gl.getUniformLocation(this.shaderProgram, 'time'), (Date.now() - this.startTime)/1000)

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

    private createMainMesh(): WebGLBuffer {
        return this.shaderManager.createArrayBuffer([
            1.0, 1.0,
            -1.0, 1.0,
            1.0, -1.0,
            -1.0, -1.0
        ])
    }
}