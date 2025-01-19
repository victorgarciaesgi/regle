<template>
  <main>
    invalid: {{ r$.$invalid }}
    <br />

    {{ r$.$fields.competencies.$each.map((x) => x.$invalid) }}

    <br />
    <div v-for="(item, index) in data.competencies" :key="index">
      <br />
      <br />
      <strong>r$.$fields.competencies.$each[index].$fields.level.$fields.id.$invalid: </strong>
      <code> {{ r$.$fields.competencies.$each[index].$fields.level?.$fields?.id?.$invalid }}</code>
      <br />
      <br />
      <strong>r$.$fields.competencies.$each[index].$fields.level.$fields.id.$value: </strong>
      <code> {{ r$.$fields.competencies.$each[index].$fields.level?.$fields?.id?.$value }}</code>
      <br />
      <br />
      <strong>r$.$fields.level.$value: </strong>
      <code> {{ r$.$fields.competencies.$each[index].$fields.level?.$value }}</code>
      <br />
      <br />
      {{ item.competency }} {{ item.level?.id }}
      <button
        v-if="!item.level"
        @click="
          () => {
            item.level = { id: 1 };
          }
        "
      >
        set level
      </button>
      <button
        v-else
        @click="
          () => {
            item.level = undefined;
          }
        "
      >
        unset level
      </button>
      <hr />
    </div>
    <strong> r$.$value: </strong>
    <code> {{ r$.$value }} </code>
  </main>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useRegle } from '@regle/core';
import { maxLength, minLength, required } from '@regle/rules';

const data = ref<{
  competencies: { competency: string; level?: { id: number } }[];
}>({
  competencies: [
    {
      competency: 'c1',
      level: { id: 1 },
    },
    {
      competency: 'c2',
      level: undefined,
    },
  ],
});

const { r$ } = useRegle(data, {
  competencies: {
    $each: () => ({
      level: {
        id: { required },
      },
    }),
  },
});
</script>
