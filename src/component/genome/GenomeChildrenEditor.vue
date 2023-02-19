<template>
  <div class="c-genome-children-editor">
    <CellSplitPreview :genome="genome"/>
  </div>
</template>

<script setup lang="ts">
import {computed, inject, Ref} from "vue";
import {GenomeLibraryEntry} from "@/game/GenomeLibrary";
import Genome from "@/game/Genome";
import CellSplitPreview from "@/component/genome/CellSplitPreview.vue";

const selectedGenomeEntry = inject('selectedGenomeEntry') as Ref<GenomeLibraryEntry | null>
const genome: Ref<Genome> = computed(() =>
    selectedGenomeEntry.value ? selectedGenomeEntry.value!.genome : Genome.newNullGenome()
);
</script>

<style>

</style>