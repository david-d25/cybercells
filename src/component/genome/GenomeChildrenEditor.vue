<template>
  <div class="c-genome-children-editor">
    <CellSplitPreview class="preview" :genome="genome"/>
    <div class="inputs">
      <InputLabel class="label">Split mass</InputLabel>
      <SliderWithNumberInput :min="0"
                             :max="500"
                             :step="1"
                             :disabled="!selectedGenomeEntry"
                             v-model="genome.splitMass"/>

      <InputLabel class="label">Split angle</InputLabel>
      <SliderWithNumberInput :min="0"
                             :max="360"
                             :step="1"
                             :disabled="!selectedGenomeEntry"
                             v-model="genome.splitAngle"/>
      <Checkbox class="input checkbox"
                :disabled="!selectedGenomeEntry"
                v-model="genome.stickOnSplit">
        Stick children together
      </Checkbox>

      <InputLabel class="label">Child A angle</InputLabel>
      <SliderWithNumberInput :min="0"
                             :max="360"
                             :step="1"
                             :disabled="!selectedGenomeEntry"
                             v-model="genome.child1Angle"/>

      <InputLabel class="label">Child B angle</InputLabel>
      <SliderWithNumberInput :min="0"
                             :max="360"
                             :step="1"
                             :disabled="!selectedGenomeEntry"
                             v-model="genome.child2Angle"/>
<!--      <InputLabel class="label">Child B genome</InputLabel>-->
<!--      <GenomeSelector :library="genomeLibrary"-->
<!--                      :disabled="!selectedGenomeEntry"-->
<!--                      v-model="genome.children[1]"/>-->
<!--      <InputLabel class="label">Child A genome</InputLabel>-->
<!--      <GenomeSelector :library="genomeLibrary"-->
<!--                      :disabled="!selectedGenomeEntry"-->
<!--                      v-model="genome.children[0]"/>-->

      <Checkbox class="input checkbox"
                :disabled="!selectedGenomeEntry"
                v-model="genome.child1KeepConnections">
        Child A inherits connections
      </Checkbox>
      <Checkbox class="input checkbox"
                :disabled="!selectedGenomeEntry"
                v-model="genome.child2KeepConnections">
        Child B inherits connections
      </Checkbox>
    </div>
  </div>
</template>

<script setup lang="ts">
import {computed, inject, Ref} from "vue";
import GenomeLibrary, {GenomeLibraryEntry} from "@/game/GenomeLibrary";
import Genome from "@/game/Genome";
import CellSplitPreview from "@/component/genome/CellSplitPreview.vue";
import SliderWithNumberInput from "@/component/input/SliderWithNumberInput.vue";
import InputLabel from "@/component/input/InputLabel.vue";
import GenomeSelector from "@/component/genome/GenomeSelector.vue";
import Checkbox from "@/component/input/Checkbox.vue";

const genomeLibrary = inject('genomeLibrary') as Ref<GenomeLibrary>;
const selectedGenomeEntry = inject('selectedGenomeEntry') as Ref<GenomeLibraryEntry | null>
const genome: Ref<Genome> = computed(() =>
    selectedGenomeEntry.value ? selectedGenomeEntry.value!.genome : Genome.newNullGenome()
);
</script>

<style lang="scss">
.c-genome-children-editor {
  .inputs {
    margin-top: 5px;

    > .checkbox {
      margin-top: 10px;
    }

    > .label {
      margin-top: 5px;
    }
  }
}
</style>