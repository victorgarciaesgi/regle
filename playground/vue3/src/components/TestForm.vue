<template>
  <main>
    <br />
    <br />
    <br />
    <br />
    <button @click="r$.$validate">validate</button>

    <button @click="isOpen = !isOpen">Assing new value</button>
    <button @click="r$.$reset()">Reset</button>
    <button
      @click="
        form.levels.push({
          id: 3030,
          localizations: [],
        })
      "
      >Add entry</button
    >
    <br />
    <br />
    <br />
    <JSONViewer :data="r$.$errors.levels" />
    <JSONViewer :data="form" />
    <JSONViewer :data="r$" />
  </main>
</template>

<script setup lang="ts">
import { useRegle } from '@regle/core';
import { maxLength, minLength } from '@regle/rules';
import { ref, watch } from 'vue';
import JSONViewer from './JSONViewer.vue';

type Form = {
  id: number;
  localizations: any[];
  levels: {
    id: number;
    localizations: {
      id: number;
    }[];
  }[];
};
const isOpen = ref(true);
const form = ref<Form>({
  id: 0,
  levels: [
    {
      id: -1,
      localizations: [
        {
          id: 0,
        },
        {
          id: 0,
        },
      ],
    },
    {
      id: -2,

      localizations: [
        {
          id: 0,
        },
        {
          id: 0,
        },
      ],
    },
    {
      id: -3,

      localizations: [
        {
          id: 0,
        },
        {
          id: 0,
        },
      ],
    },
  ],
  localizations: [],
});

watch(
  () => isOpen.value,
  async () => {
    if (isOpen.value) form.value = defaultModel();
    else {
      form.value = {
        id: 0,
        levels: [
          {
            id: -1,
            localizations: [
              {
                id: 0,
              },
              {
                id: 0,
              },
            ],
          },
          {
            id: -2,

            localizations: [
              {
                id: 0,
              },
              {
                id: 0,
              },
            ],
          },
          {
            id: -3,

            localizations: [
              {
                id: 0,
              },
              {
                id: 0,
              },
            ],
          },
        ],
        localizations: [],
      };
    }
  }
);

const defaultModel = () => {
  return {
    id: 0,
    localizations: [],
    levels: [],
  };
};

const { r$ } = useRegle(form, () => ({
  levels: {
    minLength: minLength(3),
    maxLength: maxLength(10),
  },
}));
</script>
