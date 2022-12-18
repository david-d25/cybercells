<template>
  <div class="slider-with-number-input-wr">
    <div class="label" v-if="label">{{label}}</div>
    <div class="slider-with-number-input">
      <Slider class="slider" :min="min" :max="max" :step="step" v-model="value"/>
      <input class="text-input"
             type="text"
             v-model="value"
             ref="textInput"
             @focus="textInput.select()"
             @keydown.enter="textInput.blur()"
             @keydown.esc="textInput.blur()">
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from "vue";
import Slider from "@/components/input/Slider.vue";

const props = defineProps(['min', 'max', 'step', 'modelValue', 'label'])
const emit = defineEmits(['update:modelValue'])
const textInput = ref<HTMLInputElement>()
const value = ref<number>(0)

watch(props, () => {
  value.value = props.modelValue
})

watch(value, () => {
  emit("update:modelValue", value.value)
})
</script>

<style scoped>
.slider-with-number-input {
  display: flex;
  flex-direction: row;
  justify-content: stretch;
}

.slider {
  flex: 1;
  margin-right: 5px;
}

.text-input {
  width: 50px;
  height: 25px;
  border: none;
  border-radius: 3px;
  text-align: center;
  box-sizing: border-box;
  background: rgba(60, 60, 60, 0.75);
  color: rgb(178, 178, 178);
  transition: width .2s ease-in-out;
}

.text-input:hover {
  background: rgba(75, 75, 75, 0.75);
}

.text-input:focus {
  outline: 1px solid var(--default-active-outline);
  background: rgba(80, 80, 80, 0.75);
  color: rgb(225, 225, 225);
  width: 100px;
}

.label {
  color: rgb(150, 150, 150);
  font-size: 0.8em;
  margin-bottom: 1px;
  cursor: default;
}
</style>