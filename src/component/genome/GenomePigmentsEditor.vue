<template>
  <div class="c-genome-pigments-editor">
    <InputLabel class="label">Cyan</InputLabel>
    <SliderWithNumberInput class="input" :min="0" :max="1" :step="0.01" v-model="state.cyan"/>

    <InputLabel class="label">Magenta</InputLabel>
    <SliderWithNumberInput class="input" :min="0" :max="1" :step="0.01" v-model="state.magenta"/>

    <InputLabel class="label">Yellow</InputLabel>
    <SliderWithNumberInput class="input" :min="0" :max="1" :step="0.01" v-model="state.yellow"/>

    <InputLabel class="label">White</InputLabel>
    <SliderWithNumberInput class="input" :min="0" :max="1" :step="0.01" v-model="state.white"/>

    <div class="pigments-view">
      <GenomePigmentColorDropletIcon class="pigment-icon" color="cyan" :value="state.cyan"/>
      <GenomePigmentColorDropletIcon class="pigment-icon" color="magenta" :value="state.magenta"/>
      <GenomePigmentColorDropletIcon class="pigment-icon" color="yellow" :value="state.yellow"/>
      <GenomePigmentColorDropletIcon class="pigment-icon" color="white" :value="state.white"/>
    </div>
  </div>
</template>

<script setup lang="ts">
import InputLabel from "@/component/input/InputLabel.vue";
import Genome from "@/game/Genome";
import {ref, watch} from "vue";
import SliderWithNumberInput from "@/component/input/SliderWithNumberInput.vue";
import GenomePigmentColorDropletIcon from "@/component/genome/GenomePigmentColorDropletIcon.vue";

const props = defineProps<{
  genome: Genome | null
}>()

const state = ref({
  cyan: 0,
  magenta: 0,
  yellow: 0,
  white: 0
})

watch(props, () => {
  if (props.genome) {
    state.value = {
      cyan: props.genome.cyanPigment,
      magenta: props.genome.magentaPigment,
      yellow: props.genome.yellowPigment,
      white: props.genome.whitePigment
    }
  }
})
</script>

<style lang="scss">
.c-genome-pigments-editor {
  .label {
    margin-top: 5px;
  }

  .pigments-view {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 75px;

    .pigment-icon {
      width: 40px;
      height: 40px;
    }
  }
}
</style>