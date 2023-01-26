<template>
  <HudButton class="c-properties-tab" :active="activeTabName === name" @click="onClick">
    <slot/>
  </HudButton>
</template>

<script setup lang="ts">
import { inject, Ref } from 'vue'
import HudButton from "@/component/HudButton.vue";

const props = defineProps(['name'])
const activeTabName = inject('activeTabName') as Ref<string | null>

function onClick() {
  if (activeTabName.value == props.name)
    activeTabName.value = null
  else
    activeTabName.value = props.name
}
</script>

<style lang="scss">
.c-properties-tab {
  margin-left: 10px;
}
</style>