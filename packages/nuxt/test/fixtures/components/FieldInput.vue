<template>
  <div></div>
</template>

<script setup lang="ts">
import { type RegleFieldStatus } from '#imports';

const props = defineProps<{
  field: RegleFieldStatus<string>;
}>();

function check() {
  const foo: boolean = props.field.$rules.customRule.$metadata;
}
</script>

<style lang="scss" scoped></style>
