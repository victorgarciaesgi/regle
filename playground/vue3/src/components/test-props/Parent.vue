<template>
  <Child :field="regle.$fields.email" placeholder="Type your email" />
</template>

<script setup lang="ts">
import Child from './Child.vue';
import { useMyForm } from './myForm';

const { errors, regle, state } = useMyForm();
</script>
