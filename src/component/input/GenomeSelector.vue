<template>
  <div class="c-genome-selector">
    <div :class="{ 'dropdown-opened': dropdownOpened }" v-click-outside="cancelSelection">

      <InputLabel>Genome to edit</InputLabel>

      <div class="select-head">
        <CellGenomePreview class="select-head__preview" v-if="value" :genome="modelValue?.genome"/>
        <input class="select-head__name-input"
               placeholder="Select genome"
               v-model="nameInput"
               @focus="onInputFocus"
               @keydown.esc="cancelSelection"
        />
        <button class="select-head__dropdown-trigger" @click="dropdownOpened = !dropdownOpened"/>
      </div>

      <div class="dropdown" v-show="dropdownOpened">
        <div class="dropdown-item"
             v-for="item in libraryEntriesFiltered"
             :key="item.name"
             @click="() => select(item)">
          <div class="dropdown-item__preview-wr">
            <CellGenomePreview class="dropdown-item__preview" :genome="item.genome"/>
          </div>
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
import {computed, ref, watch} from "vue";
import GenomeLibrary, {GenomeLibraryEntry} from "@/game/GenomeLibrary";
import InputLabel from "@/component/input/InputLabel.vue";
import CellGenomePreview from "@/component/CellGenomePreview.vue";

const emit = defineEmits(['update:modelValue'])
const props = defineProps<{
  library: GenomeLibrary,
  modelValue?: GenomeLibraryEntry
}>()

const nameInput = ref(props.modelValue ? props.modelValue.name : "")
const dropdownOpened = ref(false)
const value = ref<GenomeLibraryEntry | null>(null)

const libraryEntriesFiltered = computed(() => {
  if (value.value && nameInput.value === value.value.name)
    return props.library.entries
  else
    return [...props.library.entries].filter(e => e.name.includes(nameInput.value))
})

watch(value, () => {
  emit('update:modelValue', value.value)
  resetNameInput();
})

watch(props, () => {
  if (props.modelValue)
    value.value = props.modelValue
  resetNameInput();
})

function onInputFocus(e: InputEvent) {
  dropdownOpened.value = true;
  const input = e.target as HTMLInputElement;
  input.select()
}

function select(item: GenomeLibraryEntry) {
  value.value = item
  dropdownOpened.value = false;
}

function cancelSelection() {
  dropdownOpened.value = false
  resetNameInput();
}

function resetNameInput() {
  if (value.value == null)
    nameInput.value = '';
  else
    nameInput.value = value.value.name
}
</script>

<style lang="scss">
.c-genome-selector {
  position: relative;

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
    width: 28px;
    height: 28px;
  }

  .select-head__name-input {
    background: transparent;
    border: none;
    outline: none;
    line-height: 28px;
    margin-left: 5px;
    color: var(--properties-input-color);
    font-size: 1em;
    flex: 1;

    &::placeholder {
      color: rgb(128, 128, 128);
    }
  }

  .select-head__dropdown-trigger {
    height: 100%;
    width: 28px;
    border: none;
    background: var(--properties-button-bg);
    border-radius: 0 3px 3px 0;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;

    &:after {
      display: block;
      content: '';
      width: 0;
      height: 0;
      border-left: 6px solid transparent;
      border-right: 6px solid transparent;
      border-top: 6px solid rgb(180, 180, 180)
    }

    &:hover {
      background: var(--properties-button-bg__hover);
    }

    &:active {
      background: var(--properties-button-bg__active);
      border-radius: 0 3px 0 0;
    }
  }

  .dropdown {
    min-height: 15px;
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
      background: var(--properties-button-bg__active);
      border-radius: 0 3px 0 0;
    }
  }

  .dropdown-item__preview-wr {
    width: 28px;
    height: 28px;
  }

  .dropdown-item__preview {
    width: 100%;
    height: 100%;
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
}
</style>