<template>
<canvas ref="canvas" width="640" height="480"></canvas>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { mat4 } from 'gl-matrix'
import fragmentShaderSource from 'raw-loader!/shaders/test.frag'
import vertexShaderSource from 'raw-loader!@/shaders/test.vert'

const canvas = ref<HTMLCanvasElement>()

onMounted(initGl)

function initGl() {
    const gl = canvas.value?.getContext('webgl2')
    if (gl == null) {
        console.error("Unable to initialize WebGL!")
        return
    }

    const shaderProgram = initShaderProgram(gl, vertexShaderSource, fragmentShaderSource)!!
    const programInfo = {
        program: shaderProgram,
        attribLocations: {
            vertexPosition: gl.getAttribLocation(shaderProgram, "vertexPosition")
        },
        uniformLocations: {
            viewMatrix: gl.getUniformLocation(shaderProgram, "viewMatrix")
        }
    }

    const buffersInfo = initBuffers(gl)

    drawScene(gl, programInfo, buffersInfo)
}

function drawScene(gl: WebGL2RenderingContext, programInfo: any, buffersInfo: any) {
    gl.clearColor(0, 0, 0, 1)
    gl.clearDepth(1)
    gl.enable(gl.DEPTH_TEST)
    gl.depthFunc(gl.LEQUAL)

    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)

    const aspect = gl.canvas.clientWidth / gl.canvas.clientHeight
    const viewMatrix = mat4.create()
    mat4.translate(viewMatrix, viewMatrix, [0, 0, 0])

    {
        const componentsNum = 2
        const type = gl.FLOAT
        const normalize = false
        const stride = 0
        const offset = 0
        gl.bindBuffer(gl.ARRAY_BUFFER, buffersInfo.position)
        gl.vertexAttribPointer(
            programInfo.attribLocations.vertexPosition,
            componentsNum,
            type,
            normalize,
            stride,
            offset
        )
        gl.enableVertexAttribArray(programInfo.attribLocations.vertexPosition)
    }

    gl.useProgram(programInfo.program)
    gl.uniformMatrix4fv(programInfo.uniformLocations.viewMatrix, false, viewMatrix)

    {
        const offset = 0
        const vertexCount = 4
        gl.drawArrays(gl.TRIANGLE_STRIP, offset, vertexCount)
    }
}

function initBuffers(gl: WebGL2RenderingContext) {
    const positionBuffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer)
    const positions = [
        1.0, 1.0,
        -1.0, 1.0,
        1.0, -1.0,
        -1.0, -1.0
    ]
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW)
    return {
        position: positionBuffer
    }
}

function initShaderProgram(gl: WebGL2RenderingContext, vertexShaderSource: string, fragmentShaderSource: string): WebGLProgram | null {
    const vertexShader = loadShader(gl, gl.VERTEX_SHADER, vertexShaderSource)
    const fragmentShader = loadShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource)

    if (vertexShader == null || fragmentShader == null)
        return null

    const shaderProgram = gl.createProgram()!!
    gl.attachShader(shaderProgram, vertexShader)
    gl.attachShader(shaderProgram, fragmentShader)
    gl.linkProgram(shaderProgram)

    if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
        console.error(`Couldn't link shaders! Logs:\n${gl.getProgramInfoLog(shaderProgram)}`)
        return null
    }

    return shaderProgram
}

function loadShader(gl: WebGL2RenderingContext, type: number, source: string): WebGLShader | null {
    const shader = gl.createShader(type)!!
    gl.shaderSource(shader, source)
    gl.compileShader(shader)

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error(`Couldn't compile shaders! Logs:\n${gl.getShaderInfoLog(shader)}`)
        return null;
    }

    return shader
}
</script>