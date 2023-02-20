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

      <InputLabel class="label">Child B genome</InputLabel>
      <GenomeSelector :library="genomeLibrary"
                      :disabled="!selectedGenomeEntry"
                      v-model="child1GenomeEntry"/>
      <InputLabel class="label">Child A genome</InputLabel>
      <GenomeSelector :library="genomeLibrary"
                      :disabled="!selectedGenomeEntry"
                      v-model="child2GenomeEntry"/>

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
import {computed, inject, ref, Ref, watch} from "vue";
import GenomeLibrary, {GenomeLibraryEntry} from "@/game/GenomeLibrary";
import Genome from "@/game/Genome";
import CellSplitPreview from "@/component/genome/CellSplitPreview.vue";
import SliderWithNumberInput from "@/component/input/SliderWithNumberInput.vue";
import InputLabel from "@/component/input/InputLabel.vue";
import Checkbox from "@/component/input/Checkbox.vue";
import GenomeSelector from "@/component/genome/GenomeSelector.vue";

const genomeLibrary = inject('genomeLibrary') as Ref<GenomeLibrary>;
const selectedGenomeEntry = inject('selectedGenomeEntry') as Ref<GenomeLibraryEntry | null>
const genome: Ref<Genome> = computed(() =>
    selectedGenomeEntry.value ? selectedGenomeEntry.value!.genome : Genome.newNullGenome()
);

const child1GenomeEntry = ref<GenomeLibraryEntry | null>();
const child2GenomeEntry = ref<GenomeLibraryEntry | null>();

watch(genome, () => {
  child1GenomeEntry.value = genomeLibrary.value.lookupByGenome(genome.value.children[0]);
  child2GenomeEntry.value = genomeLibrary.value.lookupByGenome(genome.value.children[1]);
});

watch(child1GenomeEntry, () => {
  genome.value.children[0] = child1GenomeEntry.value?.genome || genome.value;
});
watch(child2GenomeEntry, () => {
  genome.value.children[1] = child2GenomeEntry.value?.genome || genome.value;
});
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