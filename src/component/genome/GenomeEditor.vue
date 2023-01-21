<template>
  <PropertiesSection title="Genome editor">
    <GenomeSelector :library="library" v-model="selectedGenomeEntry"/>
    <PropertiesSubheader>Pigments</PropertiesSubheader>
    <GenomePigmentsEditor :genome="selectedGenome"/>
  </PropertiesSection>
</template>

<script setup lang="ts">
import {computed, inject, ref, Ref} from "vue";
import PropertiesSection from "@/component/properties/PropertiesSection.vue";
import GenomeLibrary, { GenomeLibraryEntry } from "@/game/GenomeLibrary";
import GenomeSelector from "@/component/genome/GenomeSelector.vue";
import GenomePigmentsEditor from "@/component/genome/GenomePigmentsEditor.vue";
import PropertiesSubheader from "@/component/properties/PropertiesSubheader.vue";
import Genome from "@/game/Genome";

const library = inject('genomeLibrary') as Ref<GenomeLibrary>

let selectedGenomeEntry = ref<GenomeLibraryEntry | null>(null)
let selectedGenome: Ref<Genome | null> = computed(() => selectedGenomeEntry.value?.genome || null)
</script>