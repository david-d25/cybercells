<template>
  <div>
    <div class="select-wr" :class="{ 'dropdown-opened': dropdownOpened }">

      <InputLabel>Genome to edit</InputLabel>

      <div class="select-head">
        <div class="select-head__preview" v-if="value"></div>
        <div class="select-head__name" v-if="value">{{value.name}}</div>
        <div class="select-head__name no-selection" v-else>Not selected</div>
        <button class="select-head__dropdown-trigger" @click="dropdownOpened = !dropdownOpened"/>
      </div>

      <div class="dropdown" v-if="dropdownOpened">
        <div class="dropdown-item" v-for="item in props.library.entries" :key="item.name" @click="dropdownOpened = false; value = item">
          <div class="dropdown-item__preview"></div>
          <div class="dropdown-item__name">
            {{item.name}}
          </div>
          <div class="dropdown-item__controls"></div>
        </div>
        <div class="new-item-button"></div>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import {ref, watch} from "vue";
import GenomeLibrary, {GenomeLibraryEntry} from "@/game/GenomeLibrary";
import InputLabel from "@/component/input/InputLabel.vue";

const emit = defineEmits(['update:modelValue'])
const props = defineProps<{
  library: GenomeLibrary,
  modelValue?: GenomeLibraryEntry
}>()

const dropdownOpened = ref(false)
const value = ref<GenomeLibraryEntry | null>(null)

watch(value, () => {
  emit('update:modelValue', value.value)
})

watch(props, () => {
  if (props.modelValue)
    value.value = props.modelValue
})
</script>

<style scoped lang="scss">
.select-wr {
  position: relative;
}

.select-head {
  height: 28px;
  background: var(--properties-input-bg);
  color: var(--properties-input-color);
  display: flex;
  justify-content: end;
  border-radius: 3px;
  overflow: hidden;
}

.select-head__preview {
  background: url('@public/texture-placeholder.jpg') repeat center / cover;
  width: 28px;
  height: 28px;
}

.select-head__name {
  line-height: 28px;
  margin-left: 5px;
  flex: 1;

  &.no-selection {
    color: rgb(128, 128, 128);
  }
}

.select-head__dropdown-trigger {
  height: 100%;
  width: 28px;
  background: var(--properties-button-bg) url("@public/texture-placeholder.jpg") repeat center / cover;
  border: 1px solid var(--properties-button-outline);
  border-radius: 0 3px 3px 0;
  cursor: pointer;

  &:hover {
    background: var(--properties-button-bg__hover) url("@public/texture-placeholder.jpg") repeat center / cover;;
  }
}

.dropdown {
  min-height: 100px;
  width: 100%;
  position: absolute;
  border-radius: 0 0 3px 3px;
  background: var(--properties-input-bg);
  overflow: hidden;
}

.dropdown-opened {
  .select-head {
    border-radius: 3px 3px 0 0;
  }

  .select-head__dropdown-trigger {
    background: var(--properties-button-bg__active) url("@public/texture-placeholder.jpg") repeat center / cover;;
    border-radius: 0 3px 0 0;
  }
}

.dropdown-item__preview {
  background: url('@public/texture-placeholder.jpg') repeat center / cover;
  width: 28px;
  height: 28px;
}

.dropdown-item {
  cursor: default;
  display: flex;
  flex-direction: row;
  align-items: center;

  &:hover {
    background: rgba(255, 255, 255, 0.2);
  }

  .dropdown-item__name {
    margin-left: 5px;
  }
}
</style>