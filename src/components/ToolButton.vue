<template>
  <button class="button" :class="{ active }"><slot/></button>
</template>

<script setup lang="ts">
const props = defineProps(['active'])
</script>

<style scoped>
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

.button.active {
  border: 1px solid #00bbffe6;
  background: #00abffc9;
}
</style>