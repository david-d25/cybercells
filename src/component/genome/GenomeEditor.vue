<template>
  <div>
    <PropertiesSubheader>Pigments</PropertiesSubheader>
    <GenomePigmentsEditor/>
    <PropertiesSubheader>Children</PropertiesSubheader>
    <GenomeChildrenEditor/>
  </div>
</template>

<script setup lang="ts">
import PropertiesSubheader from "@/component/properties/PropertiesSubheader.vue";
import GenomePigmentsEditor from "@/component/genome/GenomePigmentsEditor.vue";
import GenomeChildrenEditor from "@/component/genome/GenomeChildrenEditor.vue";
</script>