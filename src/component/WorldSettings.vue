<template>
  <PropertiesSection class="c-world-settings-tab-body" title="World settings">
    <InputLabel>Gravity</InputLabel>
    <SliderWithNumberInput class="slider-input" :min="-5" :max="5" :step="0.01" v-model.number="world.gravity.y"/>

    <InputLabel>Density</InputLabel>
    <SliderWithNumberInput class="slider-input" :min="0" :max="1.5" :step="0.01" v-model.number="world.density" :disabled="true"/>

    <InputLabel>Viscosity</InputLabel>
    <SliderWithNumberInput class="slider-input" :min="0" :max="0.8" :step="0.01" v-model.number="world.viscosity"/>

    <InputLabel>Light intensity</InputLabel>
    <SliderWithNumberInput class="slider-input" :min="0" :max="0.8" :step="0.01" v-model.number="world.lightIntensity" :disabled="true"/>
  </PropertiesSection>
</template>

<script setup lang="ts">
import { inject } from "vue";

import World from "@/game/world/World";

import PropertiesSection from "@/component/properties/PropertiesSection.vue";
import SliderWithNumberInput from "@/component/input/SliderWithNumberInput.vue";
import InputLabel from "@/component/input/InputLabel.vue";

const world = inject('world') as World;
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