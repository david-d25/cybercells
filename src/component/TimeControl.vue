<template>
  <div class="c-time-control">
    <HudButton class="button pause-play-button"
               border-radius="default 0 0 default"
               border-width="default 0.5px default default"
               @click="onPausePlayButtonClick"
    >
<!--      TODO-->
    </HudButton>

    <HudButton class="button play-1x-button"
               border-radius="0"
               border-width="default 0.5px"
               :active="updater.simulationSpeed === 1"
               @click="() => onSpeedButtonClick(1)"
    >
      x1
    </HudButton>

    <HudButton class="button play-2x-button"
               border-radius="0"
               border-width="default 0.5px"
               :active="updater.simulationSpeed === 2"
               @click="() => onSpeedButtonClick(2)"
    >
      x2
    </HudButton>

    <HudButton class="button play-5x-button"
               border-radius="0.5px default default 0"
               border-width="default default default 0.5px"
               :active="updater.simulationSpeed === 5"
               @click="() => onSpeedButtonClick(5)"
    >
      x5
    </HudButton>
  </div>
</template>

<script setup lang="ts">
import {computed, inject, Ref} from "vue";

import HudButton from "@/component/HudButton.vue";
import WorldUpdater from "@/game/world/WorldUpdater";

const updater = inject('worldUpdater') as Ref<WorldUpdater>;

function onPausePlayButtonClick() {
  if (updater.value.simulationActive)
    updater.value.pauseSimulation();
  else
    updater.value.startSimulation();
}

function onSpeedButtonClick(speed: number) {
  updater.value.simulationSpeed = speed;
  updater.value.startSimulation();
}
</script>

<style lang="scss">
.c-time-control {
  pointer-events: all;
  position: fixed;
  display: flex;
  bottom: 10px;
  left: 10px;

  .button {
    color: white;
    font-size: 18px;
  }
}
</style>