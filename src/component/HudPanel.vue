<template>
  <div class="c-controls-panel">

    <PropertiesTabbedPanel class="properties-container">
      <template #tabs>
        <PropertiesTab class="properties-tab" name="genome-editor">
          <img class="properties-tab__icon" src="@public/icon/properties/genome-editor.svg" alt="Tab icon">
        </PropertiesTab>
        <PropertiesTab class="properties-tab" name="settings">
          <img class="properties-tab__icon" src="@public/icon/properties/settings.svg" alt="Tab icon">
        </PropertiesTab>
      </template>
      <template #bodies>
        <PropertiesTabBody name="genome-editor">
          <GenomeLibraryEditor/>
        </PropertiesTabBody>
        <PropertiesTabBody name="settings">
          <WorldSettings/>
        </PropertiesTabBody>
      </template>
    </PropertiesTabbedPanel>

    <div class="tool-buttons-container">
      <HudButton class="tool-button"
                  v-for="tool in toolsManager.tools"
                  :key="tool.name"
                  :disabled="!tool.enabled"
                  :active="toolsManager.currentTool === tool"
                  @click="toolsManager.currentTool = tool">
        <img class="tool-button__icon" :src="tool.icon" alt="Tool icon">
      </HudButton>
    </div>

    <TimeControl/>

  </div>
</template>

<script setup lang="ts">
import { inject } from "vue";
import PropertiesTabbedPanel from "@/component/properties/PropertiesTabbedPanel.vue";
import PropertiesTab from "@/component/properties/PropertiesTab.vue";
import ToolsManager from "@/tool/ToolsManager";
import HudButton from "@/component/HudButton.vue";
import PropertiesTabBody from "@/component/properties/PropertiesTabBody.vue";
import WorldSettings from "@/component/WorldSettings.vue";
import GenomeLibraryEditor from "@/component/genome/GenomeLibraryEditor.vue";
import TimeControl from "@/component/TimeControl.vue";

const toolsManager = inject('toolsManager') as ToolsManager;
</script>

<style lang="scss">

.c-controls-panel {
  pointer-events: none;
  position: fixed;
  bottom: 0;
  right: 0;
  left: 0;
  top: 0;

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

  .tool-button {
    padding: 5px;
    margin-left: 10px;
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
}
</style>