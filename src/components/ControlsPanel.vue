<template>
  <div class="controls-panel">

    <PropertiesTabbedPanel class="properties-container">
      <template #tabs>
        <PropertiesTab class="properties-tab" name="genome-editor">
          <img class="properties-tab__icon" src="@public/texture-placeholder.jpg" alt="Tab icon">
        </PropertiesTab>
        <PropertiesTab class="properties-tab" name="settings">
          <img class="properties-tab__icon" src="@public/icons/settings.svg" alt="Tab icon">
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
                  @click="toolsManager.currentTool = tool">
        <img class="tool-button__icon" src="@public/texture-placeholder.jpg" alt="Tool icon">
      </ToolButton>
    </div>

  </div>
</template>

<script setup lang="ts">
import { inject } from "vue";
import PropertiesTabbedPanel from "@/components/properties/PropertiesTabbedPanel.vue";
import PropertiesTab from "@/components/properties/PropertiesTab.vue";
import ToolsManager from "@/game/tool/ToolsManager";
import ToolButton from "@/components/ToolButton.vue";
import WorldSettingsTabBody from "@/components/properties/WorldSettingsTabBody.vue";
import GenomeEditorTabBody from "@/components/properties/GenomeEditorTabBody.vue";

const toolsManager = inject('toolsManager') as ToolsManager;
</script>

<style scoped lang="scss">
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
  padding: 5px;
  margin-bottom: 10px;

  .tool-button__icon {
    width: 100%;
  }
}

.tool-button:last-child {
  margin-bottom: 0;
}

.properties-tab {
  padding: 5px;
}

.properties-tab__icon {
  width: 100%;
}
</style>