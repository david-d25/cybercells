<template>
  <button class="button" :class="{ active: activeTabName === props.name }" @click="onClick">
    <slot/>
  </button>
</template>

<script setup lang="ts">
import { inject, ref } from 'vue'

const props = defineProps(['name'])
const activeTabName = inject('activeTabName', ref(null))

function onClick() {
  if (activeTabName.value == props.name)
    activeTabName.value = null
  else
    activeTabName.value = props.name
}
</script>

<style>
.button {
  border-radius: 4px;
  border: 1px solid #8e8e8e;
  background: #2f2f2fc4;
  backdrop-filter: blur(5px);
  width: 40px;
  height: 40px;
  margin-left: 10px;
  padding: 0;
  cursor: pointer;
}

.button:hover {
/*TODO*/
}

.button.active {
  border: 1px solid #00bbffe6;
  background: #00abffc9;
}
</style>