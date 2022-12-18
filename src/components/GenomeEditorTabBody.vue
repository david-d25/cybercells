<template>
  <PropertiesTabBody :name="name">
    <PropertiesSection>
      GENOME EDITOR
    </PropertiesSection>
  </PropertiesTabBody>
</template>

<script setup lang="ts">
import PropertiesTabBody from "@/components/PropertiesTabBody.vue";
import PropertiesSection from "@/components/PropertiesSection.vue";

const props = defineProps(['name'])
</script>