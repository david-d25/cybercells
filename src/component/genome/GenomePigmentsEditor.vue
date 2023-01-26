<template>
  <div class="c-genome-pigments-editor">
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

    <div class="pigments-view">
      <GenomePigmentColorDropletIcon class="pigment-icon" color="cyan" :value="genome.cyanPigment"/>
      <GenomePigmentColorDropletIcon class="pigment-icon" color="magenta" :value="genome.magentaPigment"/>
      <GenomePigmentColorDropletIcon class="pigment-icon" color="yellow" :value="genome.yellowPigment"/>
      <GenomePigmentColorDropletIcon class="pigment-icon" color="white" :value="genome.whitePigment"/>
    </div>
  </div>
</template>

<script setup lang="ts">
import InputLabel from "@/component/input/InputLabel.vue";
import {computed, inject, Ref} from "vue";
import SliderWithNumberInput from "@/component/input/SliderWithNumberInput.vue";
import GenomePigmentColorDropletIcon from "@/component/genome/GenomePigmentColorDropletIcon.vue";
import Genome from "@/game/Genome";
import {GenomeLibraryEntry} from "@/game/GenomeLibrary";

const selectedGenomeEntry = inject('selectedGenomeEntry') as Ref<GenomeLibraryEntry | null>
const genome: Ref<Genome> = computed(() =>
    selectedGenomeEntry.value ? selectedGenomeEntry.value!.genome : Genome.newNullGenome()
)
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
    height: 40px;

    .pigment-icon {
      width: 40px;
      height: 40px;
    }
  }
}
</style>