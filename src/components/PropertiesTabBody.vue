<template>
  <div class="body-wr" v-if="activeTabName === props.name">
    <slot/>
  </div>
</template>

<script setup lang="ts">
import { inject, ref } from 'vue'

const props = defineProps(['name'])
const activeTabName = inject('activeTabName', ref(null))
</script>

<style scoped>

</style>