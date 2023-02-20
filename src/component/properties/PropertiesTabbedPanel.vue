<template>
  <div class="c-tabbed-panel">
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

<style lang="scss">
.c-tabbed-panel {
  .tabbed-panel {
    height: 100%;
    display: flex;
    max-height: 100%;
    pointer-events: all;
    flex-direction: column;
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
    flex: 1;
    overflow: auto;
    position: relative;
    mask-image: linear-gradient(to bottom, transparent 0, black 15px, black calc(100% - 15px), transparent 100%);
    padding: 15px;
  }

  .resize-handle {
    border-radius: 20px;
    user-select: none;
    width: 10px;
    position: absolute;
    cursor: ew-resize;
    margin: auto;
    bottom: 0;
    left: 10px;
    top: 0;
  }
}
</style>