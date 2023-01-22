<template>
  <div>
    <PropertiesSubheader>Pigments</PropertiesSubheader>
    <GenomePigmentsEditor v-model="pigments"/>
    <PropertiesSubheader>Children</PropertiesSubheader>
  </div>
</template>

<script setup lang="ts">
import PropertiesSubheader from "@/component/properties/PropertiesSubheader.vue";
import GenomePigmentsEditor, { Pigments } from "@/component/genome/GenomePigmentsEditor.vue";
import {computed, inject, Ref} from "vue";
import {GenomeLibraryEntry} from "@/game/GenomeLibrary";

const selectedGenomeEntry = inject('selectedGenomeEntry') as Ref<GenomeLibraryEntry | null>

const pigments = computed({
  get() {
    const genome = selectedGenomeEntry.value?.genome
    return {
      cyan: genome ? genome.cyanPigment : 0,
      magenta: genome ? genome.magentaPigment : 0,
      yellow: genome ? genome.yellowPigment : 0,
      white: genome ? genome.whitePigment : 0
    }
  },
  set(value: Pigments) {
    const genome = selectedGenomeEntry.value?.genome
    if (genome) {
      genome.cyanPigment = value.cyan;
      genome.magentaPigment = value.magenta;
      genome.yellowPigment = value.yellow;
      genome.whitePigment = value.white;
    }
    console.log(1);
  }
})
</script>