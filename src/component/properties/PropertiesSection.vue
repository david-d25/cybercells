<template>
  <div class="section-wr">
    <div class="section-title" v-if="props.title">{{props.title}}</div>
    <div class="section-content">
      <slot/>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps(['title'])
</script>

<style scoped>
.section-wr {
  backdrop-filter: blur(15px);
  background: rgba(0, 0, 0, 0.8);
  border: 1px solid gray;
  box-shadow: 0 0 0 1px rgb(0 0 0 / 90%);
  border-radius: 6px;
  padding: 15px;
  margin-bottom: 15px;
}

.section-title {
  text-align: center;
  margin-bottom: 15px;
  color: white;
  text-transform: uppercase;
  cursor: default;
}

.section-wr:last-child {
  margin-bottom: 0;
}
</style>