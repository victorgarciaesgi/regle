<template>
  <andypf-json-viewer ref="json" :data="JSON.stringify(props.data)"></andypf-json-viewer>
</template>

<script setup lang="ts">
import { useTemplateRef, watch } from 'vue';

const json = useTemplateRef('json');

const props = defineProps<{
  data: unknown;
}>();

watch(
  () => props.data,
  (value) => {
    (json.value as any).data = JSON.stringify(value);
  },
  { deep: true }
);
</script>

<style lang="scss" scoped></style>
