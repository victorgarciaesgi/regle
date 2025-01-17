<template>
  <main>
    invalid: {{ r$.$invalid }}
    <br />
    <br />
    <button
      v-if="!data.level"
      @click="
        () => {
          data.level = { id: 1 };
        }
      "
    >
      set level
    </button>
    <button
      v-else
      @click="
        () => {
          data.level = undefined;
        }
      "
    >
      unset level
    </button>
    <br />
    <br />
    <strong>r$.$fields.level.id.$value: </strong>
    <code> {{ r$.$fields.level.$fields.id.$value }}</code>
    <br />
    <br />
    <strong>r$.$fields.level.$value: </strong>
    <code> {{ r$.$fields.level?.$value }}</code>
    <br />
    <br />
    <strong> r$.$value: </strong>
    <code> {{ r$.$value }} </code>
  </main>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useRegle } from '@regle/core';
import { maxLength, minLength, required } from '@regle/rules';

const data = ref({
  competency: 'c1',
  level: { id: 1 },
});

const { r$ } = useRegle(data, {
  competency: { required },
  level: {
    id: { required },
  },
});
</script>
