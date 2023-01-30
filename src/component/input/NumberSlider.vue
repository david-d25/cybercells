<template>
  <div class="c-number-slider">
    <input class="input"
           type="range"
           :disabled="disabled"
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
  disabled?: boolean,
  modelValue?: number
}>()

const emit = defineEmits(['update:modelValue'])
const value = ref<number>(props.modelValue || 0)

watch(props, () => {
  if (props.modelValue != null)
    value.value = props.modelValue
})

watch(value, () => {
  emit("update:modelValue", value.value)
})
</script>

<style scoped lang="scss">
.c-number-slider {
  line-height: 0;

  .input {
    width: 100%;
    appearance: none;
    outline: none;
    height: 25px;
    border-radius: 3px;
    background: var(--properties-input-bg);
    margin: 0;

    &:hover {
      background: var(--properties-input-bg__hover);
    }
  }

  /* Don't join the next two rules, they won't work */
  .input::-moz-range-thumb {
    appearance: none;
    width: 20px;
    height: 25px;
    background: rgb(178, 178, 178);
    border: 1px solid rgb(120, 120, 120);
    border-radius: 3px;
  }
  .input::-webkit-slider-thumb {
    appearance: none;
    width: 20px;
    height: 25px;
    background: rgb(178, 178, 178);
    border: 1px solid rgb(120, 120, 120);
    border-radius: 3px;
  }

  /* Don't join the next two rules, they won't work */
  .input:focus::-webkit-slider-thumb {
    background: rgb(225, 225, 225);
  }
  .input:focus::-moz-range-thumb {
    background: rgb(225, 225, 225);
  }

  .input:focus {
    outline: 1px solid var(--hud-button-outline__active);
  }

  .input[disabled] {
    background: var(--properties-input-bg);
    opacity: 0.5;
  }
}
</style>