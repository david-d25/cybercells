<template>
  <div class="c-cell-split-preview">
<!--    todo single cell -->
<!--    todo arrow -->
<!--    todo split cell -->
  </div>
</template>

<script setup lang="ts">
import Genome from "@/game/Genome";

const props = withDefaults(
    defineProps<{
      genome: Genome | null
    }>(), {
      genome: null
    }
);
</script>

<style lang="scss">
.c-cell-split-preview {
  background-color: var(--properties-input-bg);
  border-radius: 10px;
  margin-top: 10px;
  height: 60px;
  padding: 5px;
}
</style>