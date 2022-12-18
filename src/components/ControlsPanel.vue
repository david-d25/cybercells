<template>
  <div class="controls-panel">

    <PropertiesTabbedPanel class="properties-container">
      <template #tabs>
        <PropertiesTab class="properties-tab" name="genome-editor">

        </PropertiesTab>
        <PropertiesTab class="properties-tab" name="settings">
          <img class="properties-tab-icon" src="/icons/settings.svg" alt="icon">
        </PropertiesTab>
      </template>
      <template #bodies>
        <GenomeEditorTabBody name="genome-editor"/>
        <WorldSettingsTabBody name="settings"/>
      </template>
    </PropertiesTabbedPanel>

    <div class="tool-buttons-container">
      <ToolButton class="tool-button"
                  v-for="tool in toolsManager.tools"
                  :key="tool.id"
                  :active="toolsManager.currentTool === tool"
                  @click="toolsManager.currentTool = tool"/>
    </div>

  </div>
</template>

<script setup lang="ts">
import { inject } from "vue";
import PropertiesTabbedPanel from "@/components/PropertiesTabbedPanel.vue";
import PropertiesTab from "@/components/PropertiesTab.vue";
import ToolsManager from "@/game/tool/ToolsManager";
import ToolButton from "@/components/ToolButton.vue";
import WorldSettingsTabBody from "@/components/WorldSettingsTabBody.vue";
import GenomeEditorTabBody from "@/components/GenomeEditorTabBody.vue";

const toolsManager = inject('toolsManager') as ToolsManager;
</script>

<style scoped>
.properties-container {
  position: fixed;
  right: 0;
  top: 0;
  bottom: 0;
}

.tool-buttons-container {
  position: fixed;
  left: 0;
  top: 0;
  bottom: 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
  pointer-events: all;
}

.controls-panel {
  pointer-events: none;
}

.tool-button {
  margin-bottom: 10px;
}

.tool-button:last-child {
  margin-bottom: 0;
}

.properties-tab {
  padding: 5px;
}

.properties-tab-icon {
  width: 100%;
}
</style>