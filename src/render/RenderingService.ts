import ShaderManager from "@/gl/ShaderManager";

import commonVertexShaderSource from 'raw-loader!@/shader/common.vert';
import backgroundFragmentShaderSource from 'raw-loader!@/shader/background.frag';
import cellFragmentShaderSource from 'raw-loader!@/shader/cell.frag';
import wallFragmentShaderSource from 'raw-loader!@/shader/wall.frag';
import foodFragmentShaderSource from 'raw-loader!@/shader/food.frag';
import emptyFragmentShaderSource from 'raw-loader!@/shader/empty.frag';
import Vector2 from "@/geom/Vector2";
import Cell from "@/game/world/object/Cell";
import Wall from "@/game/world/object/Wall";
import Geometry from "@/geom/Geometry";
import ColorUtil from "@/util/ColorUtil";
import RenderingContext from "@/render/RenderingContext";

export default class RenderingService {
    private static readonly MAX_FOOD_PER_DRAW = 256;

    private readonly startTime = Date.now()

    private readonly mainMesh: WebGLBuffer
    private readonly drawBufferTextureUv: WebGLBuffer

    private readonly shaderManager: ShaderManager
    private readonly shaders: {
        background: WebGLShader,
        cell: WebGLShader,
        wall: WebGLShader,
        food: WebGLShader,
        empty: WebGLShader
    };

    constructor() {
        this.shaderManager = ShaderManager.init(document.createElement("canvas"));
        this.mainMesh = this.createMainMesh();
        this.drawBufferTextureUv = this.createDrawBufferTextureUv();
        this.shaders = {
            background: this.shaderManager.newShader(commonVertexShaderSource, backgroundFragmentShaderSource),
            cell: this.shaderManager.newShader(commonVertexShaderSource, cellFragmentShaderSource),
            wall: this.shaderManager.newShader(commonVertexShaderSource, wallFragmentShaderSource),
            food: this.shaderManager.newShader(commonVertexShaderSource, foodFragmentShaderSource),
            empty: this.shaderManager.newShader(commonVertexShaderSource, emptyFragmentShaderSource)
        }
    }

    newContext(canvas: HTMLCanvasElement): RenderingContext {
        return new RenderingContext(canvas, this, this.shaderManager);
    }

    render(context: RenderingContext) {
        const targetBufferSize = context.getBufferTexturesSize()
        if (targetBufferSize.x == 0 || targetBufferSize.y == 0)
            return;

        const gl = this.shaderManager.gl;

        const targetSize = context.getBufferTexturesSize()
        this.shaderManager.gl.canvas.width = targetSize.x;
        this.shaderManager.gl.canvas.height = targetSize.y;

        context.setDrawToBufferTexture();
        context.swapBuffers();

        gl.clearColor(0, 0, 0, 0);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);

        if (context.config.layers.background)
            this.renderBackground(context);
        if (context.config.layers.food)
            this.renderFood(context);
        if (context.config.layers.cells)
            this.renderCells(context);
        if (context.config.layers.walls)
            this.renderWalls(context);

        this.renderBufferToCanvas(context);
    }

    destroy() {
        this.shaderManager.destroy();
    }

    private renderBufferToCanvas(context: RenderingContext) {
        const gl = this.shaderManager.gl;
        gl.useProgram(this.shaders.empty);

        this.setupVertexShader(this.shaders.empty);

        gl.bindFramebuffer(gl.FRAMEBUFFER, context.framebuffer);
        gl.bindTexture(gl.TEXTURE_2D, context.getSourceBufferTexture());
        gl.uniform1i(gl.getUniformLocation(this.shaders.empty, 'image'), 0);

        // this.shaderManager.gl.canvas.width = 500;
        // this.shaderManager.gl.canvas.height = 500;

        this.setDrawToCanvas();
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

        context.drawFromSource(this.shaderManager.gl.canvas);
    }

    private renderFood(context: RenderingContext) {
        if (!context.world)
            return;

        const gl = this.shaderManager.gl;
        gl.useProgram(this.shaders.food);

        this.setupVertexShader(this.shaders.food);

        const viewMatrix = context.buildViewTransform();
        gl.uniformMatrix4fv(gl.getUniformLocation(this.shaders.food, 'viewMatrix'), false, viewMatrix);

        const bufferTexturesSize = context.getBufferTexturesSize();
        gl.uniform2f(
            gl.getUniformLocation(this.shaders.food, 'imageSize'),
            bufferTexturesSize.x,
            bufferTexturesSize.y
        );

        const foodIterator = context.world!.food.values();
        for (let chunkStart = 0; chunkStart < context.world.food.size; chunkStart += RenderingService.MAX_FOOD_PER_DRAW) {
            gl.bindFramebuffer(gl.FRAMEBUFFER, context.framebuffer);
            gl.bindTexture(gl.TEXTURE_2D, context.getSourceBufferTexture());
            gl.uniform1i(gl.getUniformLocation(this.shaders.food, 'image'), 0);

            const remainingFoodToDraw = Math.min(chunkStart + RenderingService.MAX_FOOD_PER_DRAW, context.world.food.size);
            let chunkLocalIndex = 0;
            for (let globalIndex = chunkStart; globalIndex < remainingFoodToDraw; globalIndex++) {
                const food = foodIterator.next().value;
                gl.uniform2f(gl.getUniformLocation(this.shaders.food, `food[${chunkLocalIndex}].center`), food.center.x, food.center.y);
                gl.uniform1f(gl.getUniformLocation(this.shaders.food, `food[${chunkLocalIndex}].radius`), food.radius);
                chunkLocalIndex++;
            }
            gl.uniform1i(gl.getUniformLocation(this.shaders.food, `foodNumber`), remainingFoodToDraw);

            context.setDrawToBufferTexture();
            gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

            context.swapBuffers();
        }
    }

    private renderWalls(context: RenderingContext) {
        if (!context.world)
            return;

        const gl = this.shaderManager.gl
        gl.useProgram(this.shaders.wall)

        this.setupVertexShader(this.shaders.wall);

        const viewMatrix = context.buildViewTransform()
        gl.uniformMatrix4fv(gl.getUniformLocation(this.shaders.wall, 'viewMatrix'), false, viewMatrix);

        const bufferTexturesSize = context.getBufferTexturesSize();
        gl.uniform2f(
            gl.getUniformLocation(this.shaders.wall, 'imageSize'),
            bufferTexturesSize.x,
            bufferTexturesSize.y
        );

        for (const wall of context.world.walls.values()) {
            gl.bindFramebuffer(gl.FRAMEBUFFER, context.framebuffer);
            gl.bindTexture(gl.TEXTURE_2D, context.getSourceBufferTexture());
            gl.uniform1i(gl.getUniformLocation(this.shaders.wall, 'image'), 0);

            gl.uniform2f(gl.getUniformLocation(this.shaders.wall, 'wall.a'), wall.a.x, wall.a.y);
            gl.uniform2f(gl.getUniformLocation(this.shaders.wall, 'wall.b'), wall.b.x, wall.b.y);

            context.setDrawToBufferTexture();
            gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

            context.swapBuffers();
        }
    }

    private renderCells(context: RenderingContext) {
        if (!context.world)
            return

        const gl = this.shaderManager.gl;
        gl.useProgram(this.shaders.cell);

        this.setupVertexShader(this.shaders.cell);

        gl.uniform1f(gl.getUniformLocation(this.shaders.cell, 'time'), (Date.now() - this.startTime)/1000);
        const viewMatrix = context.buildViewTransform();
        gl.uniformMatrix4fv(gl.getUniformLocation(this.shaders.cell, 'viewMatrix'), false, viewMatrix);

        const bufferTexturesSize = context.getBufferTexturesSize();
        gl.uniform2f(
            gl.getUniformLocation(this.shaders.cell, 'imageSize'),
            bufferTexturesSize.x,
            bufferTexturesSize.y
        );

        for (const cell of context.world.cells.values()) {
            const aabb = cell.aabb; // TODO scale by 2 to handle the bigger visual AABB
            const [
                [aabbMinX, aabbMinY],
                [aabbMaxX, aabbMaxY]
            ] = [
                context.project([aabb[0], aabb[1]]),
                context.project([aabb[2], aabb[3]])
            ];
            if (aabbMaxX < 0 || aabbMaxY < 0
                || aabbMinX > gl.drawingBufferWidth
                || aabbMinY > gl.drawingBufferHeight
            ) continue;

            const cellRgba = ColorUtil.cmywToRgba(
                cell.genome.cyanPigment,
                cell.genome.magentaPigment,
                cell.genome.yellowPigment,
                cell.genome.whitePigment
            )

            gl.bindFramebuffer(gl.FRAMEBUFFER, context.framebuffer)
            gl.bindTexture(gl.TEXTURE_2D, context.getSourceBufferTexture())
            gl.uniform1i(gl.getUniformLocation(this.shaders.cell, 'image'), 0)

            gl.uniform1i(gl.getUniformLocation(this.shaders.cell, 'cell.id'), cell.id);
            gl.uniform2f(gl.getUniformLocation(this.shaders.cell, 'cell.center'), cell.center.x, cell.center.y);
            gl.uniform2f(gl.getUniformLocation(this.shaders.cell, 'cell.speed'), cell.speed.x, cell.speed.y);
            gl.uniform1f(gl.getUniformLocation(this.shaders.cell, 'cell.mass'), cell.mass);
            gl.uniform1f(gl.getUniformLocation(this.shaders.cell, 'cell.angle'), cell.angle);
            gl.uniform1f(gl.getUniformLocation(this.shaders.cell, 'cell.radius'), cell.radius);
            gl.uniform4f(gl.getUniformLocation(this.shaders.cell, 'cell.bodyRgba'), ...cellRgba);

            let obstaclesStruct: {
                a: Vector2,
                b: Vector2
            }[] = [];

            context.world.circleCast(cell.center, cell.radius).forEach(wo => {
                if (wo instanceof Cell) {
                    const intersections = Geometry.findCirclesIntersections(cell.center, cell.radius, wo.center, wo.radius);
                    obstaclesStruct.push({
                        a: intersections[0],
                        b: intersections[1]
                    });
                } else if (wo instanceof Wall) {
                    obstaclesStruct.push({
                        a: wo.a,
                        b: wo.b
                    });
                }
            });

            obstaclesStruct = obstaclesStruct.slice(0, 32);

            obstaclesStruct.forEach((wall, index) => {
                gl.uniform2f(gl.getUniformLocation(this.shaders.cell, `obstacles[${index}].a`), wall.a.x, wall.a.y);
                gl.uniform2f(gl.getUniformLocation(this.shaders.cell, `obstacles[${index}].b`), wall.b.x, wall.b.y);
            })
            gl.uniform1i(gl.getUniformLocation(this.shaders.cell, 'obstaclesSize'), obstaclesStruct.length);

            context.setDrawToBufferTexture();
            gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

            context.swapBuffers()
        }
    }

    private setupVertexShader(shader: WebGLShader) {
        const gl = this.shaderManager.gl
        const vertexAttributeLoc = gl.getAttribLocation(shader, 'vertexPosition')
        gl.bindBuffer(gl.ARRAY_BUFFER, this.mainMesh)
        gl.vertexAttribPointer(vertexAttributeLoc, 2, gl.FLOAT, false, 0, 0)
        gl.enableVertexAttribArray(vertexAttributeLoc)
        const textureCoordinateLoc = gl.getAttribLocation(shader, 'textureCoordinate')
        gl.enableVertexAttribArray(textureCoordinateLoc)
        gl.bindBuffer(gl.ARRAY_BUFFER, this.drawBufferTextureUv)
        gl.vertexAttribPointer(textureCoordinateLoc, 2, gl.FLOAT, false, 0, 0)
    }

    private renderBackground(context: RenderingContext) {
        if (!context.world)
            return

        const gl = this.shaderManager.gl
        gl.useProgram(this.shaders.background)

        this.setupVertexShader(this.shaders.background);

        const viewMatrix = context.buildViewTransform()
        gl.uniformMatrix4fv(gl.getUniformLocation(this.shaders.background, 'viewMatrix'), false, viewMatrix)
        gl.uniform1f(gl.getUniformLocation(this.shaders.background, 'time'), (Date.now() - this.startTime)/1000)
        gl.uniform2f(gl.getUniformLocation(this.shaders.background, 'areaSize'), context.world.width, context.world.height)
        gl.uniform1f(gl.getUniformLocation(this.shaders.background, 'lightIntensity'), context.world.lightIntensity)

        context.setDrawToBufferTexture();
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)

        context.swapBuffers()
    }

    private setDrawToCanvas() {
        const gl = this.shaderManager.gl;
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
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
}
