<template>
  <div class="viewer-wr" ref="containerRef">
    <canvas class="canvas"
            ref="canvasRef"
            @click="onClick"/>
  </div>
</template>

<script setup lang="ts">
import { ref, inject, onMounted, Ref } from 'vue';
import WorldState from "@/game/state/WorldState";
import WorldRenderer from "@/render/WorldRenderer";

const canvasRef = ref<HTMLCanvasElement>()
const containerRef = ref<HTMLDivElement>()

let worldState: Ref<WorldState> = inject('worldState')!

let canvas: HTMLCanvasElement,
    container: HTMLDivElement

let renderer: WorldRenderer

onMounted(init)

function init() {
  canvas = canvasRef.value!
  container = containerRef.value!
  renderer = WorldRenderer.init(canvas, worldState.value)
  new ResizeObserver(onCanvasResize).observe(container)
  renderingRoutine();
}

function onClick(event: MouseEvent) {
  const dps = window.devicePixelRatio
  const [ screenX, screenY ] = [event.x * dps, event.y * dps]
  const [ worldX, worldY ] = renderer.unproject([screenX, screenY])

  console.log(`Screen coords ${screenX} ${screenY}`)
  console.log(`World coords ${worldX} ${worldY}`)
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