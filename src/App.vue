<template>
  <WorldViewer class="area-viewer"/>
  <ControlsPanel class="controls-panel"/>
</template>

<script setup lang="ts">
import { provide, ref } from "vue";

import WorldViewer from "@/components/WorldViewer.vue";
import ControlsPanel from "@/components/ControlsPanel.vue";
import GenomeLibrary, {GenomeLibraryEntry} from "@/game/GenomeLibrary";
import WorldState from "@/game/state/WorldState";
import AppPreferences from "@/AppPreferences";
import ToolsManager from "@/game/tool/ToolsManager";
import AddCellTool from "@/game/tool/AddCellTool";
import RemoveCellTool from "@/game/tool/RemoveCellTool";
import Genome from "@/game/Genome";

const tools = [ new AddCellTool(), new RemoveCellTool() ]
const worldState = WorldState.TEMPORARY_DEBUG

const genomeLibrary = new GenomeLibrary()
genomeLibrary.entries.add(new GenomeLibraryEntry(
    "test1",
    Genome.newSampleGenome()
))
genomeLibrary.entries.add(new GenomeLibraryEntry(
    "test2",
    Genome.newSampleGenome()
))
genomeLibrary.entries.add(new GenomeLibraryEntry(
    "test3",
    Genome.newSampleGenome()
))
genomeLibrary.entries.add(new GenomeLibraryEntry(
    "test4",
    Genome.newSampleGenome()
))

provide('worldState', ref<WorldState>(worldState))
provide('genomeLibrary', ref<GenomeLibrary>(genomeLibrary))
provide('appPreferences', ref<AppPreferences>(new AppPreferences()))
provide('toolsManager', ref(new ToolsManager(tools, worldState)))

// todo provide updater
</script>

<style lang="scss">
@import "@/style/variables.scss";

body {
  margin: 0;
  font-family: sans-serif;
  color: #e7e7e7;
}

.area-viewer {
  height: 100vh;
}

.controls-panel {
  position: fixed;
  bottom: 0;
  right: 0;
  left: 0;
  top: 0;
}
</style>