<template>
  <label class="c-checkbox" :class="{disabled}">
    <input type="checkbox" class="input" :class="{ checked: value }" :disabled="disabled" v-model="value">
    <slot/>
  </label>
</template>

<script setup lang="ts">
import {ref, watch} from "vue";

const props = defineProps<{ modelValue?: boolean, disabled?: boolean }>();
const emit = defineEmits(['update:modelValue'])
const value = ref<boolean>();

watch(value, () => emit('update:modelValue', value.value));
watch(props, () => value.value = props.modelValue || false);
</script>

<style lang="scss">
.c-checkbox {
  display: flex;
  align-items: center;

  &.disabled {
    opacity: 0.5;
    pointer-events: none;
  }

  .input {
    cursor: pointer;
    appearance: none;
    width: 1.5em;
    height: 1.5em;
    border-radius: 2px;
    border: 1px solid white;
    margin: 0 0.5em 0 0;
    position: relative;

    &:before {
      display: block;
      content: '';
      width: 80%;
      height: 80%;
      position: absolute;
      background: white;
      left: 10%;
      top: 10%;
      border-radius: 0.5px;
      transform: scale(0);
      transition: transform 100ms ease-in-out;
    }

    &.checked:before {
      transform: scale(1);
    }
  }
}
</style>