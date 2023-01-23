<template>
  <WorldViewer/>
  <ControlsPanel class="controls-panel"/>
</template>

<script setup lang="ts">
import { provide, ref } from "vue";

import WorldViewer from "@/component/WorldViewer.vue";
import ControlsPanel from "@/component/ControlsPanel.vue";
import GenomeLibrary, {GenomeLibraryEntry} from "@/game/GenomeLibrary";
import World from "@/game/world/World";
import AppPreferences from "@/AppPreferences";
import ToolsManager from "@/game/tool/ToolsManager";
import AddCellTool from "@/game/tool/AddCellTool";
import RemoveCellTool from "@/game/tool/RemoveCellTool";
import Genome from "@/game/Genome";
import SelectionTool from "@/game/tool/SelectionTool";

const tools = [ new SelectionTool(), new AddCellTool(), new RemoveCellTool() ]
const worldState = World.TEMPORARY_DEBUG

const genomeLibrary = new GenomeLibrary()
genomeLibrary.entries.add(new GenomeLibraryEntry("my genome", Genome.newSampleGenome()))
genomeLibrary.entries.add(new GenomeLibraryEntry("test", Genome.newSampleGenome()))
genomeLibrary.entries.add(new GenomeLibraryEntry("aaaaaaaaa", Genome.newSampleGenome()))
genomeLibrary.entries.add(new GenomeLibraryEntry("aboba", Genome.newSampleGenome()))

provide('worldState', ref<World>(worldState))
provide('genomeLibrary', ref<GenomeLibrary>(genomeLibrary))
provide('appPreferences', ref<AppPreferences>(new AppPreferences()))
provide('toolsManager', ref(new ToolsManager(tools, worldState)))

</script>

<style lang="scss">
@import "@/style/variables.scss";

body {
  margin: 0;
  font-family: sans-serif;
  color: #e7e7e7;
}
</style>