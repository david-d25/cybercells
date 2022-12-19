<template>
  <PropertiesTabBody :name="props.name">
    <PropertiesSection title="World settings">
      <SliderWithNumberInput class="slider-input" label="Gravity" :min="0" :max="2" :step="0.01" v-model.number="inputs.gravity"/>
      <SliderWithNumberInput class="slider-input" label="Density" :min="0" :max="1.5" :step="0.01" v-model.number="inputs.density"/>
      <SliderWithNumberInput class="slider-input" label="Viscosity" :min="0" :max="0.8" :step="0.01" v-model.number="inputs.viscosity"/>
    </PropertiesSection>
  </PropertiesTabBody>
</template>

<script setup lang="ts">
import { inject, reactive, watch, Ref } from "vue";

import WorldState from "@/game/state/WorldState";

import PropertiesTabBody from "@/components/properties/PropertiesTabBody.vue";
import PropertiesSection from "@/components/properties/PropertiesSection.vue";
import SliderWithNumberInput from "@/components/input/SliderWithNumberInput.vue";
import Vector2 from "@/geom/Vector2";

const props = defineProps(['name'])
const worldState = inject('worldState') as Ref<WorldState>
const inputs = reactive({
  gravity: 0,
  density: 0,
  viscosity: 0,
})

watch(inputs, () => {
  const world = worldState.value
  world.gravity = new Vector2(0, inputs.gravity)
  world.density = inputs.density
  world.viscosity = inputs.viscosity
})
</script>

<style scoped>
.slider-input {
  width: 100%;
  margin-bottom: 5px;
}

.slider-input:last-child {
  margin-bottom: 0;
}
</style>