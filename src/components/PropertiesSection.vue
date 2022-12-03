<template>
  <div class="section-wr">
    <slot/>
  </div>
</template>

<style scoped>
.section-wr {
  backdrop-filter: blur(5px);
  background: rgba(0, 0, 0, 0.5);
  border: 1px solid gray;
  box-shadow: 0 0 0 1px rgb(0 0 0 / 90%);
  border-radius: 6px;
  padding: 15px;
  margin-bottom: 15px;
}

.section-wr:last-child {
  margin-bottom: 0;
}
</style>