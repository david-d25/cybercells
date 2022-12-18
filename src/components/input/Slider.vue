<template>
  <div class="slider-container">
    <input class="slider-input" type="range" :min="min" :max="max" :step="step" v-model="value">
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from "vue";

const props = defineProps(['min', 'max', 'step', 'modelValue'])
const emit = defineEmits(['update:modelValue'])
const value = ref<number>(0)

watch(props, () => {
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
  background: rgba(127, 127, 127, 0.1);
  margin: 0;
}

.slider-input:hover {
  background: rgba(127, 127, 127, 0.2);
}

/* Don't join the next two rules, they won't work */
.slider-input::-moz-range-thumb {
  appearance: none;
  width: 20px;
  height: 25px;
  background: rgb(178, 178, 178);
  border-radius: 3px;
  border: none;
}
.slider-input::-webkit-slider-thumb {
  appearance: none;
  width: 20px;
  height: 25px;
  background: rgb(178, 178, 178);
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
  outline: 1px solid var(--default-active-outline);
}
</style>