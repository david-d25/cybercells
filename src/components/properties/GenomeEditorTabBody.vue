<template>
  <PropertiesTabBody :name="name">
    <PropertiesSection title="Genome editor">
      <GenomeSelector :library="library" v-model="selectedGenome"/>
    </PropertiesSection>
  </PropertiesTabBody>
</template>

<script setup lang="ts">
import { inject, ref, Ref } from "vue";
import PropertiesTabBody from "@/components/properties/PropertiesTabBody.vue";
import PropertiesSection from "@/components/properties/PropertiesSection.vue";
import GenomeLibrary, { GenomeLibraryEntry } from "@/game/GenomeLibrary";
import GenomeSelector from "@/components/input/GenomeSelector.vue";

defineProps<{ name: string }>()
const library = inject('genomeLibrary') as Ref<GenomeLibrary>

let selectedGenome = ref<GenomeLibraryEntry | null>(null)
</script>