<template>
  <WorldViewer class="area-viewer"/>
  <ControlsPanel class="controls-panel"/>
</template>

<script setup lang="ts">
import { provide, ref } from "vue";

import WorldViewer from "@/components/WorldViewer.vue";
import ControlsPanel from "@/components/ControlsPanel.vue";
import GenomeLibrary from "@/game/GenomeLibrary";
import WorldState from "@/game/state/WorldState";
import AppPreferences from "@/AppPreferences";
import ToolsManager from "@/game/tool/ToolsManager";
import AddCellTool from "@/game/tool/AddCellTool";
import RemoveCellTool from "@/game/tool/RemoveCellTool";

const tools = [ new AddCellTool(), new RemoveCellTool() ]
const worldState = WorldState.TEMPORARY_DEBUG

provide('worldState', ref<WorldState>(worldState))
provide('genomeLibrary', ref<GenomeLibrary>(new GenomeLibrary()))
provide('appPreferences', ref<AppPreferences>(new AppPreferences()))
provide('toolsManager', ref(new ToolsManager(tools, worldState)))

// todo provide updater
</script>

<style>
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