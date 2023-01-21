<template>
  <div class="с-genome-single-pigment-editor">
    <SliderWithNumberInput class="input" :min="0" :max="1" :step="0.01" v-model="value"/>
    <GenomePigmentColorDropletIcon class="icon" :color="props.color" :value="value"/>
  </div>
</template>

<script setup lang="ts">
import SliderWithNumberInput from "@/component/input/SliderWithNumberInput.vue";
import GenomePigmentColorDropletIcon from "@/component/genome/GenomePigmentColorDropletIcon.vue";
import {ref, watch} from "vue";

const props = defineProps({
  color: {
    type: String,
    default: "white"
  },
  modelValue: {
    type: Number,
    default: 0
  }
});

const emit = defineEmits(['update:modelValue'])
const value = ref<number>(0)

watch(props, () => {
  if (props.modelValue)
    value.value = props.modelValue
})

watch(value, () => {
  emit('update:modelValue', value);
})

</script>

<style lang="scss">
.с-genome-single-pigment-editor {
  display: flex;

  .icon {
    width: 25px;
    height: 25px;
  }

  .input {
    flex: 1;
  }
}
</style>