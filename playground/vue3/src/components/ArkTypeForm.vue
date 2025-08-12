<template>
  <div v-for="(item, index) of r$.level1.collection.$each" :key="item.$id" class="item">
    <div class="field">
      <input
        v-model.number="item.$value.name"
        :class="{ valid: item.name.$correct, error: item.name.$error }"
        placeholder="Type an item value"
      />

      <div
        v-if="r$.$value.level1.collection.length > 1"
        class="delete"
        @click="r$.$value.level1.collection.splice(index, 1)"
      >
        🗑️
      </div>
    </div>

    <ul v-if="item.name.$errors.length">
      <li v-for="error of item.name.$errors" :key="error">
        {{ error }}
      </li>
    </ul>
  </div>

  Array errors:
  <ul v-if="r$.level1.collection.$errors.$self.length">
    <li v-for="error of r$.level1.collection.$errors.$self" :key="error">
      {{ error }}
    </li>
  </ul>

  <button type="button" @click="r$.$value.level1.collection.push({ name: 0 })"> 🆕 Add item </button>
  <button @click="r$.$reset({ toInitialState: true })">Reset</button>
  <button @click="r$.$validate">Submit</button>
</template>

<script setup lang="ts">
import { useRegleSchema } from '@regle/schemas';
import { type } from 'arktype';
import { reactive } from 'vue';

const form = reactive({
  level0: 0,
  level1: {
    child: 1,
    level2: {
      child: 2,
    },
    collection: [{ name: undefined as number | undefined }],
  },
});

const arkIsEven = type('number').narrow((data, ctx) => {
  return data % 2 === 0 ? true : ctx.reject({ message: 'Custom error' });
});

const schema = type({
  'level0?': 'number',
  level1: type({
    'child?': 'number',
    level2: type({
      'child?': 'number',
    }),
    collection: type({
      name: 'number',
    })
      .array()
      .atLeastLength(3)
      .configure({ message: () => 'Array must contain at least 3 element(s)' }),
  }),
});

const { r$ } = useRegleSchema(form, schema);
</script>

<style lang="scss" scoped></style>
