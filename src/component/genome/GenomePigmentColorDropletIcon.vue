<template>
  <div class="c-genome-pigment-color-droplet-icon">
    <canvas class="canvas" ref="canvasRef"/>
  </div>
</template>

<script setup lang="ts">
import {onBeforeUnmount, onMounted, Ref, ref, watch} from "vue";

const canvasRef = ref() as Ref<HTMLCanvasElement>;
let canvasCtx: CanvasRenderingContext2D | null = null
let canvasSizeObserver: ResizeObserver

const props = defineProps({
  color: {
    type: String,
    default: "white"
  },
  value: {
    type: Number,
    default: 1
  }
});

watch(props, drawDroplet);

onMounted(startObservingCanvasSizeChange);
onBeforeUnmount(stopObservingCanvasSizeChange)

function startObservingCanvasSizeChange() {
  canvasSizeObserver = new ResizeObserver(onCanvasResize)
  canvasSizeObserver.observe(canvasRef.value);
}

function stopObservingCanvasSizeChange() {
  canvasSizeObserver.disconnect();
}

function onCanvasResize() {
  const canvas = canvasRef.value
  const dpr = window.devicePixelRatio;
  const { width, height } = canvas.getBoundingClientRect();
  canvas.width = Math.round(width * dpr);
  canvas.height = Math.round(height * dpr);
  drawDroplet();
}

function drawDroplet() {
  const canvas = canvasRef.value;
  const { width: w, height: h } = canvas;
  canvasCtx = canvasCtx || canvas.getContext('2d')!;
  const gradient = canvasCtx.createLinearGradient(0.5 * w, 0.2 * h, 0.5 * w, 0.85 * h);
  const clippedValue = Math.min(1, Math.max(0, props.value));
  gradient.addColorStop(0, "transparent");
  gradient.addColorStop(1 - clippedValue, "transparent");
  gradient.addColorStop(1 - clippedValue, props.color);
  gradient.addColorStop(1, props.color);
  canvasCtx.clearRect(0, 0, w, h);
  canvasCtx.strokeStyle = props.color;
  canvasCtx.fillStyle = gradient;
  canvasCtx.lineWidth = 2;
  canvasCtx.beginPath();
  canvasCtx.moveTo(0.5 * w, 0.2 * h);
  canvasCtx.lineTo(0.75 * w, 0.6 * h);
  canvasCtx.arc(0.5 * w, 0.6 * h, 0.25 * w, 0, Math.PI);
  canvasCtx.lineTo(0.5 * w, 0.2 * h);
  canvasCtx.stroke();
  canvasCtx.fill();
}
</script>

<style lang="scss">
.c-genome-pigment-color-droplet-icon {
  .canvas {
    width: 100%;
    height: 100%;
  }
}
</style>