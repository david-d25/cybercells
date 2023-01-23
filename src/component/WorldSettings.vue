<template>
  <PropertiesSection class="c-world-settings-tab-body" title="World settings">
    <InputLabel>Gravity</InputLabel>
    <SliderWithNumberInput class="slider-input" :min="0" :max="2" :step="0.01" v-model.number="inputs.gravity"/>

    <InputLabel>Density</InputLabel>
    <SliderWithNumberInput class="slider-input" :min="0" :max="1.5" :step="0.01" v-model.number="inputs.density"/>

    <InputLabel>Viscosity</InputLabel>
    <SliderWithNumberInput class="slider-input" :min="0" :max="0.8" :step="0.01" v-model.number="inputs.viscosity"/>
  </PropertiesSection>
</template>

<script setup lang="ts">
import { inject, reactive, watch, Ref } from "vue";

import World from "@/game/world/World";

import PropertiesSection from "@/component/properties/PropertiesSection.vue";
import SliderWithNumberInput from "@/component/input/SliderWithNumberInput.vue";
import Vector2 from "@/geom/Vector2";
import InputLabel from "@/component/input/InputLabel.vue";

const worldState = inject('worldState') as Ref<World>
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

<style lang="scss">
.c-world-settings-tab-body {
  .slider-input {
    width: 100%;
    margin-bottom: 5px;
  }

  .slider-input:last-child {
    margin-bottom: 0;
  }
}
</style>