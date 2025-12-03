<template>
  <div style="display: flex; flex-direction: column; gap: 16px; width: 500px">
    <input v-model="r$.$value.name" />

    <ul v-if="r$.name?.$errors?.length">
      <li v-for="error in r$.name.$errors">
        {{ error }}
      </li>
    </ul>

    <!-- Array field -->
    <div style="border: 1px solid; padding: 14px" v-for="field in r$.array?.$each">
      <input type="text" :key="field.$id" v-model="field.$value.test" />

      <ul v-if="field.test.$errors.length > 0">
        <li v-for="error in field.test.$errors">
          {{ error }}
        </li>
      </ul>

      <!-- Nested array field -->
      <div style="border: 1px solid; padding: 14px; margin-top: 15px" v-for="nested_field in field.nested_array.$each">
        <input type="text" :key="nested_field.$id" v-model="nested_field.$value.rest" />
        <ul v-if="nested_field.rest.$errors.length > 0">
          <li v-for="error in nested_field.rest.$errors">
            {{ error }}
          </li>
        </ul>
      </div>
    </div>

    <button @click="addTopLevel">Add one top level array field</button>
    <button @click="moveTopLevelUp">Move last up</button>
    <button @click="submit">Submit me!</button>
  </div>

  <!-- Errors -->
  <pre>{{ r$.$errors }}</pre>
</template>

<script setup lang="ts">
import { useRegleSchema } from '@regle/schemas';
import { z } from 'zod';

const schema = z.object({
  name: z.string().min(1),
  array: z.array(
    z.object({
      test: z.string().min(1),
      nested_array: z.array(
        z.object({
          rest: z.string().min(1),
        })
      ),
    })
  ),
});

const values = {
  array: [{ test: 'array', nested_array: [{ rest: 'nested' }] }],
};

const { r$ } = useRegleSchema(values, schema, {
  rewardEarly: true,
});

const submit = async () => {
  const res = await r$.$validate();
  console.log(res);
};

const addTopLevel = () => {
  r$.$value.array.push({ test: '', nested_array: [{ rest: '' }] });
};

// Moves the top level array's item one index higher within the array
const moveTopLevelUp = () => {
  r$.$value.array.unshift(r$.$value.array.pop());
};
</script>
