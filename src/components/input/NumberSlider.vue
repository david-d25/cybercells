<template>
  <div class="slider-container">
    <input class="slider-input"
           type="range"
           :min="min"
           :max="max"
           :step="step"
           v-model="value">
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from "vue";

const props = defineProps<{
  min?: number,
  max?: number,
  step?: number,
  modelValue?: number
}>()

const emit = defineEmits(['update:modelValue'])
const value = ref<number>(0)

watch(props, () => {
  if (props.modelValue)
    value.value = props.modelValue
})

watch(value, () => {
  emit("update:modelValue", value.value)
})
</script>

<style scoped>
.slider-container {
  line-height: 0;
}

.slider-input {
  width: 100%;
  appearance: none;
  outline: none;
  height: 25px;
  border-radius: 3px;
  background: var(--properties-input-bg);
  margin: 0;
}

.slider-input:hover {
  background: var(--properties-input-bg__hover);
}

/* Don't join the next two rules, they won't work */
.slider-input::-moz-range-thumb {
  appearance: none;
  width: 20px;
  height: 25px;
  background: rgb(178, 178, 178);
  border: 1px solid rgb(120, 120, 120);
  border-radius: 3px;
}
.slider-input::-webkit-slider-thumb {
  appearance: none;
  width: 20px;
  height: 25px;
  background: rgb(178, 178, 178);
  border: 1px solid rgb(120, 120, 120);
  border-radius: 3px;
}

/* Don't join the next two rules, they won't work */
.slider-input:focus::-webkit-slider-thumb {
  background: rgb(225, 225, 225);
}
.slider-input:focus::-moz-range-thumb {
  background: rgb(225, 225, 225);
}

.slider-input:focus {
  outline: 1px solid var(--tools-button-outline__active);
}
</style>