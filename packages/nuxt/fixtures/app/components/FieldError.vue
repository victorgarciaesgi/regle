<template>
  <ul class="text-sm text-red-400 mt-1">
    <li v-for="error of props.errors" :key="error" class="field-error"> {{ error }} </li>
  </ul>
</template>

<script setup lang="ts">
const props = defineProps<{
  errors: string[];
}>();
</script>
