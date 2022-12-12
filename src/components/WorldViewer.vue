<template>
  <div class="viewer-wr" ref="containerRef">
    <canvas class="canvas"
            ref="canvasRef"
            @click="onMouseEvent"
            @mousedown="onMouseEvent"
            @mouseup="onMouseEvent"
            @mousemove="onMouseEvent"
            @mouseleave="onMouseEvent"
            @wheel.prevent="onWheel"/>
  </div>
</template>

<script setup lang="ts">
import { ref, inject, onMounted, Ref } from 'vue';
import WorldState from "@/game/state/WorldState";
import WorldRenderer from "@/render/WorldRenderer";
import WorldMouseEvent from "@/game/event/WorldMouseEvent";

const SCROLL_SENSITIVITY = 0.005

const canvasRef = ref<HTMLCanvasElement>()
const containerRef = ref<HTMLDivElement>()

const emit = defineEmits<{(e: string, payload: WorldMouseEvent): void}>()

let worldState: Ref<WorldState> = inject('worldState')!
let canvas: HTMLCanvasElement
let container: HTMLDivElement
let renderer: WorldRenderer

const dragging = {
  dragMode: false,
  lastMouseWorldPoint: [0, 0]
}

onMounted(init)

function init() {
  canvas = canvasRef.value!
  container = containerRef.value!
  renderer = WorldRenderer.init(canvas, worldState.value)
  new ResizeObserver(onCanvasResize).observe(container)
  renderingRoutine();
}

function onWheel(event: WheelEvent) {
  const camera = worldState.value.camera
  if (event.deltaY > 0)
    camera.height *= 1 + event.deltaY*SCROLL_SENSITIVITY
  else
    camera.height *= 1/(1 - event.deltaY*SCROLL_SENSITIVITY)
  if (camera.height < 1)
    camera.height = 1
}

function onMouseEvent(event: MouseEvent) {
  const dps = window.devicePixelRatio
  const [ screenX, screenY ] = [event.x * dps, event.y * dps]
  let [ worldX, worldY ] = renderer.unproject([screenX, screenY])

  if (event.type === 'mousedown') {
    dragging.dragMode = true
    dragging.lastMouseWorldPoint = [ worldX, worldY ]
  }

  if (event.type === 'mousemove' && dragging.dragMode) {
    const [ prevX, prevY ] = dragging.lastMouseWorldPoint
    worldState.value.camera.center.x += prevX - worldX
    worldState.value.camera.center.y += prevY - worldY;
    [ worldX, worldY ] = renderer.unproject([screenX, screenY])
    dragging.lastMouseWorldPoint = [ worldX, worldY ]
  }

  if (event.type === 'mouseup' || event.type === 'mouseleave')
    dragging.dragMode = false

  emit(`world-${event.type}`, new WorldMouseEvent(`world-${event.type}`, screenX, screenY, worldX, worldY))
}

function renderingRoutine() {
  renderer.render()
  window.requestAnimationFrame(renderingRoutine)
}

function onCanvasResize() {
  const dpr = window.devicePixelRatio;
  const { width, height } = container.getBoundingClientRect();
  canvas.width = Math.round(width * dpr);
  canvas.height = Math.round(height * dpr);
  renderer.render()
}
</script>

<style>
.canvas {
  display: block;
  width: 100%;
  height: 100%;
}
</style>