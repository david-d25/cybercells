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

provide('worldState', ref<WorldState>(WorldState.TEMPORARY_DEBUG))
provide('genomeLibrary', ref<GenomeLibrary>(new GenomeLibrary()))
provide('appPreferences', ref<AppPreferences>(new AppPreferences()))

// todo provide updater
// todo provide tools
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