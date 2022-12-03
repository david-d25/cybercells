<template>
  <div class="controls-panel">
    <PropertiesTabbedPanel class="controls-container">
      <template #tabs>
        <PropertiesTab name="genome-editor"></PropertiesTab>
        <PropertiesTab name="settings"></PropertiesTab>
      </template>
      <template #bodies>
        <PropertiesTabBody name="genome-editor">
          <PropertiesSection>TEST</PropertiesSection>
        </PropertiesTabBody>
        <PropertiesTabBody name="settings">
          <PropertiesSection>TEST</PropertiesSection>
          <PropertiesSection>TEST</PropertiesSection>
        </PropertiesTabBody>
      </template>
    </PropertiesTabbedPanel>
  </div>
</template>

<script setup>
import PropertiesTabbedPanel from "@/components/PropertiesTabbedPanel.vue";
import PropertiesTab from "@/components/PropertiesTab.vue";
import PropertiesTabBody from "@/components/PropertiesTabBody.vue";
import PropertiesSection from "@/components/PropertiesSection.vue";
</script>

<style>
.controls-container {
  position: fixed;
  right: 0;
  top: 0;
  bottom: 0;
}

.controls-panel {
  pointer-events: none;
}
</style>