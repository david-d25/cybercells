<template>
  <PropertiesSection title="Genome editor">
    <GenomeSelector :library="library" v-model="selectedGenomeEntry"/>
    <GenomeEditor/>
  </PropertiesSection>
</template>

<script setup lang="ts">
import {inject, provide, ref, Ref} from "vue";
import PropertiesSection from "@/component/properties/PropertiesSection.vue";
import GenomeLibrary, { GenomeLibraryEntry } from "@/game/GenomeLibrary";
import GenomeSelector from "@/component/genome/GenomeSelector.vue";
import GenomeEditor from "@/component/genome/GenomeEditor.vue";

const library = inject('genomeLibrary') as Ref<GenomeLibrary>;

let selectedGenomeEntry = ref<GenomeLibraryEntry | null>(null);
provide('selectedGenomeEntry', selectedGenomeEntry);
</script>