<template>
  <PropertiesTabBody :name="name">
    <PropertiesSection>
      There will be a genome editor someday...
    </PropertiesSection>
  </PropertiesTabBody>
</template>

<script setup lang="ts">
import PropertiesTabBody from "@/components/properties/PropertiesTabBody.vue";
import PropertiesSection from "@/components/properties/PropertiesSection.vue";

const props = defineProps(['name'])
</script>