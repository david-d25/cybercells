<template>
  <PropertiesTabBody :name="props.name">
    <PropertiesSection>WORLD SETTINGS</PropertiesSection>
  </PropertiesTabBody>
</template>

<script setup lang="ts">
import PropertiesTabBody from "@/components/PropertiesTabBody.vue";
import PropertiesSection from "@/components/PropertiesSection.vue";
import WorldState from "@/game/state/WorldState";
import { inject, Ref } from "vue";

const props = defineProps(['name'])
const worldState = inject('worldState') as Ref<WorldState>
</script>