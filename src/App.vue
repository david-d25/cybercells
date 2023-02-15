<template>
  <WorldViewer @world-click="onWorldViewerEvent"/>
  <ControlsPanel class="controls-panel"/>
</template>

<script setup lang="ts">
import {provide, ref, shallowRef} from "vue";

import WorldViewer from "@/component/WorldViewer.vue";
import ControlsPanel from "@/component/HudPanel.vue";
import GenomeLibrary, {GenomeLibraryEntry} from "@/game/GenomeLibrary";
import World from "@/game/world/World";
import AppPreferences from "@/AppPreferences";
import ToolsManager from "@/tool/ToolsManager";
import AddCellTool from "@/tool/AddCellTool";
import RemoveCellTool from "@/tool/RemoveCellTool";
import Genome from "@/game/Genome";
import SelectionTool from "@/tool/SelectionTool";
import WorldUpdater from "@/game/world/updater/WorldUpdater";
import WorldMouseEvent from "@/game/event/WorldMouseEvent";

const tools = [ new SelectionTool(), new AddCellTool(), new RemoveCellTool() ];
const world = World.TEMPORARY_DEBUG;

const genomeLibrary = new GenomeLibrary();
const worldUpdater = new WorldUpdater(world);
const appPreferences = new AppPreferences();
const toolsManager = new ToolsManager(tools, world);

genomeLibrary.entries.add(new GenomeLibraryEntry("my genome", Genome.newSampleGenome()));
genomeLibrary.entries.add(new GenomeLibraryEntry("test", Genome.newSampleGenome()));
genomeLibrary.entries.add(new GenomeLibraryEntry("aaaaaaaaa", Genome.newSampleGenome()));
genomeLibrary.entries.add(new GenomeLibraryEntry("aboba", Genome.newSampleGenome()));

provide('world', world);
provide('worldUpdater', shallowRef(worldUpdater));
provide('genomeLibrary', ref(genomeLibrary));
provide('appPreferences', ref(appPreferences));
provide('toolsManager', ref(toolsManager));

function onWorldViewerEvent(event: any) {
  if (event instanceof WorldMouseEvent)
    toolsManager.dispatchEvent(event);
}
</script>

<style lang="scss">
@import "@/style/variables.scss";

body {
  margin: 0;
  font-family: sans-serif;
  color: #e7e7e7;
}
</style>