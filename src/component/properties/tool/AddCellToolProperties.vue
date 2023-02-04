<template>
  <PropertiesSection title="Add cell">
    <InputLabel>Genome of the new cell</InputLabel>
    <GenomeSelector :library="genomeLibrary" v-model="value"/>
  </PropertiesSection>
</template>
<script setup lang="ts">
import PropertiesSection from "@/component/properties/PropertiesSection.vue";
import GenomeSelector from "@/component/genome/GenomeSelector.vue";
import {inject, ref, Ref, watch} from "vue";
import GenomeLibrary, {GenomeLibraryEntry} from "@/game/GenomeLibrary";
import ToolsManager from "@/tool/ToolsManager";
import AddCellTool from "@/tool/AddCellTool";
import InputLabel from "@/component/input/InputLabel.vue";

const genomeLibrary = inject('genomeLibrary') as Ref<GenomeLibrary>;
const toolsManager = inject('toolsManager') as Ref<ToolsManager>;
const value = ref() as Ref<GenomeLibraryEntry | null>;

watch(value, () => {
  if (toolsManager.value.getSelectedTool() instanceof AddCellTool) {
    const tool = toolsManager.value.getSelectedTool() as AddCellTool;
    tool.selectedGenomeEntry = value.value;
  }
});
</script>