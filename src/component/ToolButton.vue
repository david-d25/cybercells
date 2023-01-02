<template>
  <button class="c-button" :class="{ active }"><slot/></button>
</template>

<script setup lang="ts">
defineProps<{ active: boolean }>()
</script>

<style lang="scss">
.c-button {
  border-radius: 4px;
  border: 1px solid #8e8e8e;
  background: #2f2f2fc4;
  backdrop-filter: blur(5px);
  width: 40px;
  height: 40px;
  margin-left: 10px;
  padding: 0;
  cursor: pointer;

  &.active {
    border: 1px solid var(--tools-button-outline__active);
    background: var(--tools-button-bg__active);
  }
}
</style>