<template>
  <PropertiesTabBody :name="props.name">
    <PropertiesSection title="World settings">
      <SliderWithNumberInput class="slider-input" label="Viscosity" min="0" max="2" step="0.001" v-model="inputs.viscosity"/>
    </PropertiesSection>
  </PropertiesTabBody>
</template>

<script setup lang="ts">
import { inject, reactive, watch, Ref } from "vue";

import WorldState from "@/game/state/WorldState";

import PropertiesTabBody from "@/components/properties/PropertiesTabBody.vue";
import PropertiesSection from "@/components/properties/PropertiesSection.vue";
import SliderWithNumberInput from "@/components/input/SliderWithNumberInput.vue";

const props = defineProps(['name'])
const worldState = inject('worldState') as Ref<WorldState>
const inputs = reactive({
  viscosity: 0
})

watch(inputs, () => {
  worldState.value.viscosity = inputs.viscosity
})
</script>

<style scoped>
.slider-input {
  width: 100%;
}
</style>