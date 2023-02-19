<template>
  <div class="c-cell-genome-preview">
    <canvas class="canvas" ref="canvas"/>
  </div>
</template>

<script setup lang="ts">
import Genome from "@/game/Genome";
import RenderingService from "@/render/RenderingService";
import {inject, onBeforeUnmount, onMounted, Ref, ref, watch} from "vue";
import World from "@/game/world/World";
import Vector2 from "@/geom/Vector2";
import Camera from "@/game/Camera";
import Cell from "@/game/world/object/Cell";
import RenderingContext from "@/render/RenderingContext";

const props = defineProps<{
  genome: Genome | null
}>();

const canvas = ref() as Ref<HTMLCanvasElement>;
let dummyWorld: World = World.getDefault();
let canvasSizeObserver: ResizeObserver
let renderingService = inject('renderingService') as RenderingService
let renderingContext: RenderingContext

onMounted(() => {
  renderingContext = renderingService.newContext(canvas.value);
  renderingContext.config.layers.background = false;
  canvasSizeObserver = new ResizeObserver(onCanvasResize);
  canvasSizeObserver.observe(canvas.value);
  updateRendererDummyWorld();
  renderingContext.bindWorld(dummyWorld);
  renderingContext.render()
})

onBeforeUnmount(() => {
  canvasSizeObserver.disconnect();
  renderingContext.destroy();
})

watch(props, () => {
  updateRendererDummyWorld()
  renderingContext.render();
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
  renderingContext.render();
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