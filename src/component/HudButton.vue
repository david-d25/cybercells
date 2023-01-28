<template>
  <button class="c-button" :class="{ active }" :disabled="disabled"><slot/></button>
</template>

<script setup lang="ts">
import {computed} from "vue";

const props = withDefaults(defineProps<{
  active?: boolean,
  disabled?: boolean,
  borderRadius?: string,
  borderWidth?: string,
}>(), {
  active: false,
  disabled: false,
  borderRadius: "4px",
  borderWidth: "1px"
});

let defaultsSupportingBorderRadius = computed(() => props.borderRadius.replaceAll('default', "4px"))
let defaultsSupportingBorderWidth = computed(() => props.borderWidth.replaceAll('default', "1px"))
</script>

<style lang="scss">
.c-button {
  border-color: #8e8e8e;
  border-style: solid;
  background: var(--hud-button-bg);
  backdrop-filter: blur(5px);
  width: 40px;
  height: 40px;
  padding: 0;
  cursor: pointer;
  user-select: none;
  border-radius: v-bind(defaultsSupportingBorderRadius);
  border-width: v-bind(defaultsSupportingBorderWidth);

  &:not(:disabled) {
    &:hover {
      background: var(--hud-button-bg__hover);
    }

    &:active {
      background-color: var(--hud-button-bg__pressed);
    }

    &.active {
      border-color: var(--hud-button-outline__active);
      background: var(--hud-button-bg__active);
    }
  }

  &:disabled {
    opacity: 0.5;
    cursor: default;
  }
}
</style>