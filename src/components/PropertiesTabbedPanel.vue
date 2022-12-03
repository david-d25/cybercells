<template>
  <div class="tabbed-panel-wr">
    <div class="tabbed-panel" draggable="false" :style="{ width: `${width}px`, minWidth: `${minWidth}px` }">
      <div class="tabs">
        <slot name="tabs"/>
      </div>
      <div class="body">
        <slot name="bodies"/>
        <div class="resize-handle" @mousedown="onHandleDragStart"></div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, provide } from 'vue'

const activeTabName = ref<string | null>(null)
const minWidth = 320

let dragStartX = 0
const oldWidth = ref(300)
const width = ref(oldWidth.value)

provide('activeTabName', activeTabName)

function onHandleDragStart(event: DragEvent) {
  dragStartX = event.clientX
  initHandleDragging()
}

function initHandleDragging() {
  window.addEventListener('mousemove', onHandleDrag);
  window.addEventListener('mouseleave', stopHandleDragging);
  window.addEventListener('mouseup', stopHandleDragging);
}

function onHandleDrag(event: MouseEvent) {
  if (event.screenX === 0)
    return
  let offset = dragStartX - event.clientX
  width.value = oldWidth.value + offset
  if (width.value < minWidth)
    width.value = minWidth
}

function stopHandleDragging() {
  oldWidth.value = width.value
  window.removeEventListener('mousemove', onHandleDrag);
  window.removeEventListener('mouseleave', stopHandleDragging);
  window.removeEventListener('mouseup', stopHandleDragging);
}
</script>

<style scoped>
.tabbed-panel {
  pointer-events: all;
}

.tabs {
  display: flex;
  flex-direction: row;
  flex-wrap: nowrap;
  align-content: center;
  justify-content: flex-end;
  align-items: center;
  margin-right: 15px;
  margin-top: 15px;
}

.body {
  margin: 15px;
  position: relative;
}

.resize-handle {
  border-radius: 20px;
  user-select: none;
  width: 10px;
  position: absolute;
  cursor: ew-resize;
  margin: auto;
  bottom: 0;
  left: -5px;
  top: 0;
}
</style>