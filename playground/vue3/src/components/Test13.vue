<script lang="ts" setup>
import { z } from 'zod';
import { ref, computed } from 'vue';
import { useRegleSchema } from '@regle/schemas';
import JSONViewer from './JSONViewer.vue';

const data = ref<
  Partial<{
    condition: boolean;
    nested: {
      list: {
        name: string;
      }[];
    };
  }>
>({});

const schema = computed(() => {
  return z.object({
    condition: z.boolean(),
    ...(data.value.condition === true && {
      nested: z.object({
        list: z.array(
          z.object({
            name: z.string(),
          })
        ),
      }),
    }),
  });
});

const rewardEarly = ref(true);
const { r$ } = useRegleSchema(data, schema, { rewardEarly });
</script>

<template>
  <label>
    <input type="radio" v-model="r$.$fields.condition.$value" :value="true" />
    yes
  </label>

  <label>
    <input type="radio" v-model="r$.$fields.condition.$value" :value="false" />
    no
  </label>

  <div v-if="r$.$fields.condition.$value">
    <div v-for="field in r$.$fields.nested?.$fields.list.$each" :key="field.$id">
      <input v-model="field.$fields.name.$value" :key="field.$id" />
    </div>

    <button
      @click="
        () => {
          if (r$.$fields.nested) {
            (r$.$fields.nested.$fields.list.$value ??= []).push({ name: 'John' });
          }
        }
      "
    >
      add ({{ r$.$fields.nested?.$fields.list?.$value?.length }})
    </button>

    <JSONViewer :data="r$" />
  </div>
</template>
