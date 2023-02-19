<template>
  <div class="c-world-viewer" ref="containerRef">
    <canvas class="canvas"
            ref="canvasRef"
            @click="onMouseEvent"
            @mousedown="onMouseEvent"
            @mouseup="onMouseEvent"
            @mousemove="onMouseEvent"
            @mouseleave="onMouseEvent"
            @touchstart.prevent="onTouchEvent"
            @touchmove.prevent="onTouchEvent"
            @touchend.prevent="onTouchEvent"
            @wheel.prevent="onWheel"/>
  </div>
</template>

<script setup lang="ts">
import {ref, inject, onMounted, onBeforeUnmount} from 'vue';
import World from "@/game/world/World";
import RenderingService from "@/render/RenderingService";
import WorldMouseEvent from "@/game/event/WorldMouseEvent";
import RenderingContext from "@/render/RenderingContext";

const SCROLL_SENSITIVITY = 0.005

const canvasRef = ref<HTMLCanvasElement>()
const containerRef = ref<HTMLDivElement>()

const emit = defineEmits<{(e: string, payload: WorldMouseEvent): void}>()

let world = inject('world') as World
let canvas: HTMLCanvasElement
let container: HTMLDivElement
let renderingService = inject('renderingService') as RenderingService
let renderingContext: RenderingContext

let canvasSizeObserver: ResizeObserver;
let animationFrameRequest: number;

const dragging = {
  dragged: false,
  mouseDown: false,
  lastMouseWorldPoint: [0, 0]
}

onMounted(() => {
  canvas = canvasRef.value!
  container = containerRef.value!
  renderingContext = renderingService.newContext(canvas);
  renderingContext.bindWorld(world);
  canvasSizeObserver = new ResizeObserver(onCanvasResize);
  canvasSizeObserver.observe(canvas);
  renderingRoutine();
});

onBeforeUnmount(() => {
  canvasSizeObserver.disconnect();
  window.cancelAnimationFrame(animationFrameRequest);
  renderingContext.destroy()
});

function onWheel(event: WheelEvent) {
  const camera = world.camera
  if (event.deltaY > 0)
    camera.height *= 1 + event.deltaY*SCROLL_SENSITIVITY
  else
    camera.height *= 1/(1 - event.deltaY*SCROLL_SENSITIVITY)
  if (camera.height < 1)
    camera.height = 1
}

function onTouchEvent(event: TouchEvent) {
  if (event.touches.length == 1) {
    let mouseEventType: string | undefined
    switch (event.type) {
      case 'touchstart': mouseEventType = 'mousedown'; break;
      case 'touchmove': mouseEventType = 'mousemove'; break;
      case 'touchend': mouseEventType = 'mouseup'; break;
    }
    if (mouseEventType) {
      const { clientX: x, clientY: y } = event.touches[0]
      const dps = window.devicePixelRatio
      const [ screenX, screenY ] = [x * dps, y * dps]
      let [ worldX, worldY ] = renderingContext.unproject([screenX, screenY])
      const worldEvent = new WorldMouseEvent(world, `world-${mouseEventType}`, screenX, screenY, worldX, worldY)
      handleDraggingEvent(worldEvent)
      emit(worldEvent.type, worldEvent)
    }
  }
}

function onMouseEvent(event: MouseEvent) {
  if (event.type === 'click' && dragging.dragged)
    return;
  const dps = window.devicePixelRatio
  const [ screenX, screenY ] = [event.x * dps, event.y * dps]
  let [ worldX, worldY ] = renderingContext.unproject([screenX, screenY])

  const worldEvent = new WorldMouseEvent(world, `world-${event.type}`, screenX, screenY, worldX, worldY)
  handleDraggingEvent(worldEvent)
  emit(worldEvent.type, worldEvent)
}

function handleDraggingEvent(event: WorldMouseEvent) {
  if (event.type === 'world-mousedown') {
    dragging.mouseDown = true;
    dragging.dragged = false;
    dragging.lastMouseWorldPoint = [ event.worldX, event.worldY ];
  }

  if (event.type === 'world-mousemove' && dragging.mouseDown) {
    dragging.dragged = true;
    const [ prevX, prevY ] = dragging.lastMouseWorldPoint;
    world.camera.center.x += prevX - event.worldX;
    world.camera.center.y += prevY - event.worldY;
    [ event.worldX, event.worldY ] = renderingContext.unproject([event.screenX, event.screenY]);
    dragging.lastMouseWorldPoint = [ event.worldX, event.worldY ];
  }

  if (event.type === 'world-mouseup' || event.type === 'world-mouseleave')
    dragging.mouseDown = false;
}

function renderingRoutine() {
  renderingContext.render();
  animationFrameRequest = window.requestAnimationFrame(renderingRoutine)
}

function onCanvasResize() {
  const dpr = window.devicePixelRatio;
  const { width, height } = container.getBoundingClientRect();
  canvas.width = Math.round(width * dpr);
  canvas.height = Math.round(height * dpr);
  renderingContext.render();
}
</script>

<style lang="scss">
.c-world-viewer {
  height: 100vh;

  .canvas {
    display: block;
    width: 100%;
    height: 100%;
  }
}
</style>