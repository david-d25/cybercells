<template>
  <div class="c-cell-genome-preview">
    <canvas class="canvas" ref="canvas"/>
  </div>
</template>

<script setup lang="ts">
import Genome from "@/game/Genome";
import Renderer from "@/render/Renderer";
import {onBeforeUnmount, onMounted, Ref, ref, watch} from "vue";
import World from "@/game/world/World";
import Vector2 from "@/geom/Vector2";
import Camera from "@/game/Camera";
import Cell from "@/game/world/object/Cell";

const props = defineProps<{
  genome: Genome | null
}>();

const canvas = ref() as Ref<HTMLCanvasElement>;
let dummyWorld: World = World.getDefault();
let canvasSizeObserver: ResizeObserver
let renderer: Renderer

onMounted(() => {
  renderer = new Renderer(canvas.value, dummyWorld);
  renderer.config.layers.background = false;
  canvasSizeObserver = new ResizeObserver(onCanvasResize);
  canvasSizeObserver.observe(canvas.value);
  updateRendererDummyWorld();
  renderer.render();
})

onBeforeUnmount(() => {
  canvasSizeObserver.disconnect();
})

watch(props, () => {
  updateRendererDummyWorld()
  renderer.render();
})

function updateRendererDummyWorld() {
  dummyWorld.clear();
  if (props.genome) {
    const dummyCell = new Cell(new Vector2(), new Vector2(), 300, Math.PI/4, 0, props.genome)
    dummyWorld.add(dummyCell)
    dummyWorld.camera = new Camera(new Vector2(), dummyCell.radius * 3)
  }
}

function onCanvasResize() {
  const dpr = window.devicePixelRatio;
  const { width, height } = canvas.value.getBoundingClientRect();
  canvas.value.width = Math.round(width * dpr);
  canvas.value.height = Math.round(height * dpr);
  renderer.render();
}
</script>

<style lang="scss">
.c-cell-genome-preview {
  .canvas {
    width: 100%;
    height: 100%;
  }
}
</style>