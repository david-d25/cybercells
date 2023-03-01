import Vector2 from "@/geom/Vector2";
import RenderingService from "@/render/RenderingService";
import World from "@/game/world/World";
import ShaderManager from "@/gl/ShaderManager";
import {mat4, vec2} from "gl-matrix";

export default class RenderingContext {
    config = {
        layers: {
            background: true,
            walls: true,
            cells: true,
            food: true
        }
    };
    world: World | null = null;

    readonly framebuffer: WebGLFramebuffer | null
    private sourceBufferTexture: WebGLTexture | null;
    private targetBufferTexture: WebGLTexture | null;
    private bufferTexturesSize: Vector2;
    private canvasContext: CanvasRenderingContext2D

    constructor(
        private canvas: HTMLCanvasElement,
        private renderingService: RenderingService,
        private shaderManager: ShaderManager
    ) {
        this.framebuffer = shaderManager.gl.createFramebuffer();
        this.sourceBufferTexture = shaderManager.newTexture(canvas.width, canvas.height);
        this.targetBufferTexture = shaderManager.newTexture(canvas.width, canvas.height);
        this.bufferTexturesSize = new Vector2(canvas.width, canvas.height);
        this.canvasContext = canvas.getContext("2d")!;
    }

    bindWorld(world: World | null) {
        this.world = world;
    }

    render() {
        this.updateDrawBufferTexture();
        this.renderingService.render(this);
    }

    /**
     * From world coordinates to screen coordinates.
     */
    project(worldPoint: vec2): vec2 {
        const projection = this.buildCameraTransform()
        const inverted = mat4.invert(projection, projection)
        return vec2.transformMat4(vec2.create(), worldPoint, inverted)
    }

    /**
     * From screen coordinates to world coordinates.
     */
    unproject(screenPoint: vec2): vec2 {
        return vec2.transformMat4(vec2.create(), screenPoint, this.buildCameraTransform())
    }

    drawFromSource(source: CanvasImageSource) {
        this.canvasContext.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.canvasContext.drawImage(source, 0, 0);
    }

    destroy() {
        this.shaderManager.gl.deleteFramebuffer(this.framebuffer);
        this.shaderManager.gl.deleteTexture(this.sourceBufferTexture);
        this.shaderManager.gl.deleteTexture(this.targetBufferTexture);
    }

    // TODO cache
    buildFragmentViewTransform(): mat4 {
        const canvasHeight = this.canvas.height;

        const result = mat4.create();
        mat4.scale(result, result, [1, -1, 1]);
        mat4.translate(result, result, [0, -canvasHeight, 0]);
        return result;
    }

    // TODO cache
    buildVertexViewTransform(): mat4 {
        const result = mat4.create();
        mat4.translate(result, result, [-1, 1, 0]);
        mat4.scale(result, result, [2, -2, 1]);
        mat4.scale(result, result, [1/this.canvas.width, 1/this.canvas.height, 1]);
        return result;
    }

    // TODO cache
    buildCameraTransform(): mat4 {
        if (!this.world)
            throw new Error("Can't build camera transform: the world object is not set!")

        const canvasWidth = this.canvas.width
        const canvasHeight = this.canvas.height

        const result = mat4.create()
        const camera = this.world.camera
        const scale = canvasHeight != 0 ? camera.height/canvasHeight : 1
        mat4.scale(result, result, [scale, scale, 1])
        mat4.translate(result, result, [
            camera.center.x/scale - canvasWidth/2,
            camera.center.y/scale - canvasHeight/2,
            0
        ])
        return result
    }

    updateSourceBufferTexture() {
        const gl = this.shaderManager.gl;
        const size = this.bufferTexturesSize;
        gl.bindTexture(gl.TEXTURE_2D, this.targetBufferTexture);
        gl.bindFramebuffer(gl.FRAMEBUFFER, this.framebuffer);
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, this.targetBufferTexture, 0);
        gl.bindTexture(gl.TEXTURE_2D, this.sourceBufferTexture);
        gl.copyTexImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 0, 0, size.x, size.y, 0);
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        gl.bindTexture(gl.TEXTURE_2D, null);
    }

    setDrawToBufferTexture() {
        const gl = this.shaderManager.gl;
        gl.bindFramebuffer(gl.FRAMEBUFFER, this.framebuffer);
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, this.targetBufferTexture, 0);
    }

    getBufferTexturesSize() {
        return this.bufferTexturesSize;
    }

    getSourceBufferTexture() {
        return this.sourceBufferTexture;
    }

    private updateDrawBufferTexture() {
        if (this.drawBufferTextureNeedsUpdate()) {
            const gl = this.shaderManager.gl

            gl.deleteTexture(this.sourceBufferTexture)
            gl.deleteTexture(this.targetBufferTexture)

            const width = this.canvas.width
            const height = this.canvas.height

            this.sourceBufferTexture = this.shaderManager.newTexture(width, height)
            this.targetBufferTexture = this.shaderManager.newTexture(width, height)

            this.bufferTexturesSize = new Vector2(width, height)
        }
    }

    private drawBufferTextureNeedsUpdate(): boolean {
        return this.bufferTexturesSize.x != this.canvas.width || this.bufferTexturesSize.y != this.canvas.height
    }
}