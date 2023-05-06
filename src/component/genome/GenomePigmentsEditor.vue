<template>
  <div class="c-genome-pigments-editor">
    <div class="pigments-view">
      <GenomePigmentColorDropletIcon class="pigment-icon" color="cyan" :value="genome.cyanPigment"/>
      <GenomePigmentColorDropletIcon class="pigment-icon" color="magenta" :value="genome.magentaPigment"/>
      <GenomePigmentColorDropletIcon class="pigment-icon" color="yellow" :value="genome.yellowPigment"/>
      <GenomePigmentColorDropletIcon class="pigment-icon" color="white" :value="genome.whitePigment"/>
      <svg class="pigments-view-arrow-icon" viewBox="0 0 100 100">
        <path fill="grey" d="M 0 30 h 50 v -30 l 50 50 l -50 50 v -30 h -50"/>
      </svg>
      <canvas class="final-color-canvas" ref="finalColorCanvasRef"/>
    </div>

    <InputLabel class="label">Cyan</InputLabel>
    <SliderWithNumberInput class="input"
                           :min="0"
                           :max="1"
                           :step="0.01"
                           :disabled="!selectedGenomeEntry"
                           v-model="genome.cyanPigment"/>

    <InputLabel class="label">Magenta</InputLabel>
    <SliderWithNumberInput class="input"
                           :min="0"
                           :max="1"
                           :step="0.01"
                           :disabled="!selectedGenomeEntry"
                           v-model="genome.magentaPigment"/>

    <InputLabel class="label">Yellow</InputLabel>
    <SliderWithNumberInput class="input"
                           :min="0"
                           :max="1"
                           :step="0.01"
                           :disabled="!selectedGenomeEntry"
                           v-model="genome.yellowPigment"/>

    <InputLabel class="label">White</InputLabel>
    <SliderWithNumberInput class="input"
                           :min="0"
                           :max="1"
                           :step="0.01"
                           :disabled="!selectedGenomeEntry"
                           v-model="genome.whitePigment"/>
  </div>
</template>

<script setup lang="ts">
import InputLabel from "@/component/input/InputLabel.vue";
import {computed, inject, onBeforeUnmount, onMounted, ref, Ref, watch} from "vue";
import SliderWithNumberInput from "@/component/input/SliderWithNumberInput.vue";
import GenomePigmentColorDropletIcon from "@/component/genome/GenomePigmentColorDropletIcon.vue";
import Genome from "@/game/Genome";
import {GenomeLibraryEntry} from "@/game/GenomeLibrary";
import {cmywFromGenome, cmywToRgba, rgbaToCssString} from "@/util/ColorUtil";

const selectedGenomeEntry = inject('selectedGenomeEntry') as Ref<GenomeLibraryEntry | null>
const genome: Ref<Genome> = computed(() =>
    selectedGenomeEntry.value ? selectedGenomeEntry.value!.genome : Genome.newNullGenome()
)

const finalColorCanvasRef = ref() as Ref<HTMLCanvasElement>;
let finalColorCanvasResizeObserver: ResizeObserver;
let finalColorCanvasContext: CanvasRenderingContext2D;

onMounted(() => {
  finalColorCanvasResizeObserver = new ResizeObserver(onFinalColorIndicatorResize);
  finalColorCanvasResizeObserver.observe(finalColorCanvasRef.value);
  finalColorCanvasContext = finalColorCanvasRef.value.getContext('2d')!;
});

onBeforeUnmount(() => {
  finalColorCanvasResizeObserver.disconnect();
});

watch(genome, drawFinalColorIndicator, { deep: true });

function onFinalColorIndicatorResize() {
  const canvas = finalColorCanvasRef.value!
  const dpr = window.devicePixelRatio;
  const { width, height } = canvas.getBoundingClientRect();
  canvas.width = Math.round(width * dpr);
  canvas.height = Math.round(height * dpr);
  drawFinalColorIndicator();
}

function drawFinalColorIndicator() {
  const ctx = finalColorCanvasContext;
  const rgba = cmywToRgba(cmywFromGenome(genome.value));
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  ctx.fillStyle = rgbaToCssString(rgba);
  ctx.strokeStyle = `rgb(${rgba[0] * 255}, ${rgba[1] * 255}, ${rgba[2] * 255})`;
  ctx.lineWidth = Math.min(ctx.canvas.width, ctx.canvas.height) * 0.06;
  ctx.beginPath();
  ctx.arc(ctx.canvas.width/2, ctx.canvas.height/2, Math.min(ctx.canvas.width, ctx.canvas.height)*0.45, 0, Math.PI*2)
  ctx.stroke();
  ctx.fill();
}
</script>

<style lang="scss">
.c-genome-pigments-editor {
  .label {
    margin-top: 5px;
  }

  .pigments-view {
    margin-top: 10px;
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: var(--properties-input-bg);
    border-radius: 10px;
    height: 40px;
    padding: 5px;

    .final-color-canvas,
    .pigment-icon {
      width: 40px;
      height: 40px;
    }

    .pigments-view-arrow-icon {
      width: 25px;
      height: 25px;
      margin: 10px;
    }
  }
}
</style>