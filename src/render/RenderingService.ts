import ShaderManager from "@/gl/ShaderManager";

import commonVertexShaderSource from 'raw-loader!@/shader/common.vert';
import backgroundFragmentShaderSource from 'raw-loader!@/shader/background.frag';
import cellFragmentShaderSource from 'raw-loader!@/shader/cell.frag';
import wallFragmentShaderSource from 'raw-loader!@/shader/wall.frag';
import foodVertexShaderSource from 'raw-loader!@/shader/food/food.vert';
import foodFragmentShaderSource from 'raw-loader!@/shader/food/food.frag';
import emptyFragmentShaderSource from 'raw-loader!@/shader/empty.frag';
import Vector2 from "@/geom/Vector2";
import Cell from "@/game/world/object/Cell";
import Wall from "@/game/world/object/Wall";
import Geometry from "@/geom/Geometry";
import ColorUtil from "@/util/ColorUtil";
import RenderingContext from "@/render/RenderingContext";

export default class RenderingService {
    private readonly startTime = Date.now()

    private readonly mainMesh: WebGLBuffer

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
        this.shaders = {
            background: this.shaderManager.newShader(commonVertexShaderSource, backgroundFragmentShaderSource),
            cell: this.shaderManager.newShader(commonVertexShaderSource, cellFragmentShaderSource),
            wall: this.shaderManager.newShader(commonVertexShaderSource, wallFragmentShaderSource),
            food: this.shaderManager.newShader(foodVertexShaderSource, foodFragmentShaderSource),
            empty: this.shaderManager.newShader(commonVertexShaderSource, emptyFragmentShaderSource)
        }
        this.shaderManager.gl.enable(this.shaderManager.gl.DEPTH_TEST);
        this.shaderManager.gl.depthFunc(this.shaderManager.gl.ALWAYS);
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

        gl.enable(gl.BLEND);
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
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
        context.updateSourceBufferTexture();

        const vertexAttributeLoc = gl.getAttribLocation(this.shaders.empty, 'vertexPosition')
        gl.enableVertexAttribArray(vertexAttributeLoc)
        gl.bindBuffer(gl.ARRAY_BUFFER, this.mainMesh)
        gl.vertexAttribPointer(vertexAttributeLoc, 2, gl.FLOAT, false, 0, 0)

        gl.bindFramebuffer(gl.FRAMEBUFFER, context.framebuffer);
        gl.bindTexture(gl.TEXTURE_2D, context.getSourceBufferTexture());
        gl.uniform1i(gl.getUniformLocation(this.shaders.empty, 'image'), 0);

        this.setDrawToCanvas();
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

        gl.disableVertexAttribArray(vertexAttributeLoc);
        gl.bindTexture(gl.TEXTURE_2D, null);
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);

        context.drawFromSource(this.shaderManager.gl.canvas);
    }

    private renderFood(context: RenderingContext) {
        if (!context.world)
            return;

        // TODO do not render food that is beyond screen
        // TODO do not recreate buffers

        const world = context.world;
        const gl = this.shaderManager.gl;

        if (world.food.size == 0)
            return;

        const centers: number[] = [];
        const radiuses: number[] = [];
        const vertexes: number[] = [];

        let instancesCount = 0;
        world.food.forEach(food => {
            const [x, y] = [food.center.x, food.center.y];
            const radius = food.radius;
            centers.push(x, y, x, y, x, y, x, y, x, y, x, y);
            radiuses.push(radius, radius, radius, radius, radius, radius);
            vertexes.push(
                x - radius, y - radius,
                x + radius, y - radius,
                x + radius, y + radius,
                x - radius, y + radius,
                x - radius, y - radius,
                x + radius, y + radius
            );
            instancesCount++;
        })

        gl.useProgram(this.shaders.food);
        context.updateSourceBufferTexture();

        const vertexesBuffer = gl.createBuffer();
        const centersBuffer = gl.createBuffer();
        const radiusBuffer = gl.createBuffer();

        const vertexPositionLoc = gl.getAttribLocation(this.shaders.food, 'vertexPosition');
        const foodCenterLoc = gl.getAttribLocation(this.shaders.food, 'instanceFoodCenter');
        const foodRadiusLoc = gl.getAttribLocation(this.shaders.food, 'instanceFoodRadius');

        gl.enableVertexAttribArray(vertexPositionLoc);
        gl.enableVertexAttribArray(foodCenterLoc);
        gl.enableVertexAttribArray(foodRadiusLoc);

        gl.bindBuffer(gl.ARRAY_BUFFER, vertexesBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexes), gl.STATIC_DRAW);
        gl.vertexAttribPointer(vertexPositionLoc, 2, gl.FLOAT, false, 0, 0);

        gl.bindBuffer(gl.ARRAY_BUFFER, centersBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(centers), gl.STATIC_DRAW);
        gl.vertexAttribPointer(foodCenterLoc, 2, gl.FLOAT, false, 0, 0);

        gl.bindBuffer(gl.ARRAY_BUFFER, radiusBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(radiuses), gl.STATIC_DRAW);
        gl.vertexAttribPointer(foodRadiusLoc, 1, gl.FLOAT, false, 0, 0);

        gl.uniformMatrix4fv(
            gl.getUniformLocation(this.shaders.food, 'vertexViewTransform'),
            false,
            context.buildVertexViewTransform());
        gl.uniformMatrix4fv(
            gl.getUniformLocation(this.shaders.food, 'fragmentViewTransform'),
            false,
            context.buildFragmentViewTransform());
        gl.uniformMatrix4fv(
            gl.getUniformLocation(this.shaders.food, 'cameraTransform'),
            false,
            context.buildCameraTransform()
        );

        const bufferTexturesSize = context.getBufferTexturesSize();
        gl.uniform2f(
            gl.getUniformLocation(this.shaders.food, 'imageSize'),
            bufferTexturesSize.x,
            bufferTexturesSize.y
        );

        gl.bindFramebuffer(gl.FRAMEBUFFER, context.framebuffer);
        gl.bindTexture(gl.TEXTURE_2D, context.getSourceBufferTexture());
        gl.uniform1i(gl.getUniformLocation(this.shaders.food, 'image'), 0);

        context.setDrawToBufferTexture();
        gl.drawArrays(gl.TRIANGLES, 0, 6 * instancesCount);

        gl.deleteBuffer(vertexesBuffer);
        gl.deleteBuffer(centersBuffer);
        gl.deleteBuffer(radiusBuffer);

        gl.disableVertexAttribArray(vertexPositionLoc);
        gl.disableVertexAttribArray(foodCenterLoc);
        gl.disableVertexAttribArray(foodRadiusLoc);
        gl.vertexAttribDivisor(foodCenterLoc, 0);
        gl.vertexAttribDivisor(foodRadiusLoc, 0);
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        gl.bindTexture(gl.TEXTURE_2D, null);
    }

    private renderWalls(context: RenderingContext) {
        if (!context.world)
            return;

        const gl = this.shaderManager.gl;
        gl.useProgram(this.shaders.wall);

        this.setupVertexShader(this.shaders.wall);

        gl.uniformMatrix4fv(
            gl.getUniformLocation(this.shaders.wall, 'fragmentViewTransform'),
            false,
            context.buildFragmentViewTransform());
        gl.uniformMatrix4fv(
            gl.getUniformLocation(this.shaders.wall, 'cameraTransform'),
            false,
            context.buildCameraTransform()
        );

        const bufferTexturesSize = context.getBufferTexturesSize();
        gl.uniform2f(
            gl.getUniformLocation(this.shaders.wall, 'imageSize'),
            bufferTexturesSize.x,
            bufferTexturesSize.y
        );

        for (const wall of context.world.walls.values()) {
            context.updateSourceBufferTexture();
            gl.bindFramebuffer(gl.FRAMEBUFFER, context.framebuffer);
            gl.bindTexture(gl.TEXTURE_2D, context.getSourceBufferTexture());
            gl.uniform1i(gl.getUniformLocation(this.shaders.wall, 'image'), 0);

            gl.uniform2f(gl.getUniformLocation(this.shaders.wall, 'wall.a'), wall.a.x, wall.a.y);
            gl.uniform2f(gl.getUniformLocation(this.shaders.wall, 'wall.b'), wall.b.x, wall.b.y);

            context.setDrawToBufferTexture();
            gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
        }
    }

    private renderCells(context: RenderingContext) {
        if (!context.world)
            return

        const gl = this.shaderManager.gl;
        gl.useProgram(this.shaders.cell);

        this.setupVertexShader(this.shaders.cell);

        gl.uniform1f(gl.getUniformLocation(this.shaders.cell, 'time'), (Date.now() - this.startTime)/1000);
        gl.uniformMatrix4fv(
            gl.getUniformLocation(this.shaders.cell, 'fragmentViewTransform'),
            false,
            context.buildFragmentViewTransform());
        gl.uniformMatrix4fv(
            gl.getUniformLocation(this.shaders.cell, 'cameraTransform'),
            false,
            context.buildCameraTransform()
        );

        const bufferTexturesSize = context.getBufferTexturesSize();
        gl.uniform2f(
            gl.getUniformLocation(this.shaders.cell, 'imageSize'),
            bufferTexturesSize.x,
            bufferTexturesSize.y
        );

        for (const cell of context.world.cells.values()) {
            context.updateSourceBufferTexture();
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
        }
    }

    private renderBackground(context: RenderingContext) {
        if (!context.world)
            return

        const gl = this.shaderManager.gl
        gl.useProgram(this.shaders.background)

        const vertexAttributeLoc = gl.getAttribLocation(this.shaders.background, 'vertexPosition')
        gl.enableVertexAttribArray(vertexAttributeLoc)
        gl.bindBuffer(gl.ARRAY_BUFFER, this.mainMesh)
        gl.vertexAttribPointer(vertexAttributeLoc, 2, gl.FLOAT, false, 0, 0)

        gl.uniformMatrix4fv(
            gl.getUniformLocation(this.shaders.background, 'fragmentViewTransform'),
            false,
            context.buildFragmentViewTransform());
        gl.uniformMatrix4fv(
            gl.getUniformLocation(this.shaders.background, 'cameraTransform'),
            false,
            context.buildCameraTransform()
        );

        gl.uniform1f(gl.getUniformLocation(this.shaders.background, 'time'), (Date.now() - this.startTime)/1000)
        gl.uniform2f(gl.getUniformLocation(this.shaders.background, 'areaSize'), context.world.width, context.world.height)
        gl.uniform1f(gl.getUniformLocation(this.shaders.background, 'lightIntensity'), context.world.lightIntensity)

        context.setDrawToBufferTexture();
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

        gl.disableVertexAttribArray(vertexAttributeLoc);
        gl.bindTexture(gl.TEXTURE_2D, null);
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    }

    private setupVertexShader(shader: WebGLShader) {
        const gl = this.shaderManager.gl
        const vertexAttributeLoc = gl.getAttribLocation(shader, 'vertexPosition')
        gl.enableVertexAttribArray(vertexAttributeLoc)
        gl.bindBuffer(gl.ARRAY_BUFFER, this.mainMesh)
        gl.vertexAttribPointer(vertexAttributeLoc, 2, gl.FLOAT, false, 0, 0)
    }

    private setDrawToCanvas() {
        const gl = this.shaderManager.gl;
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
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
