<template>
  <div class="c-slider-with-number-input">
    <div class="slider-with-number-input">
      <Slider class="slider" :min="min" :max="max" :step="step" v-model.number="value"/>
      <input class="text-input"
             type="text"
             v-model.number="value"
             ref="textInput"
             @focus="textInput.select()"
             @keydown.enter="textInput.blur()"
             @keydown.esc="textInput.blur()">
    </div>
  </div>
</template>

<script setup lang="ts">
import {Ref, ref, watch} from "vue";
import Slider from "@/component/input/NumberSlider.vue";

const props = defineProps<{
  min?: number,
  max?: number,
  step?: number,
  modelValue?: number,
  vertical?: boolean
}>()
const emit = defineEmits(['update:modelValue'])
const textInput = ref<HTMLInputElement>() as Ref<HTMLInputElement>
const value = ref<number>(0)

watch(props, () => {
  if (props.modelValue)
    value.value = props.modelValue
})

watch(value, () => {
  emit("update:modelValue", value.value)
})
</script>

<style lang="scss">
.c-slider-with-number-input {
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
    background: var(--properties-input-bg);
    color: var(--properties-input-color);
    transition: width .2s ease-in-out;
  }

  .text-input:hover {
    background: var(--properties-input-bg__hover);
  }

  .text-input:focus {
    outline: 1px solid var(--tools-button-outline__active);
    background: var(--properties-input-bg__focused);
    color: var(--properties-input-color__focused);
    width: 100px;
  }
}
</style>