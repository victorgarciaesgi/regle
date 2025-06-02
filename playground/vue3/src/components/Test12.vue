<script setup lang="ts">
import { ref } from 'vue';
import { type } from 'arktype';
import { useRegleSchema } from '@regle/schemas';
import { required, minLength, email } from '@regle/rules';

const state = ref({ name: '', tags: [] });

const tagSchema = type("'wolt' |'eat_in'").configure({
  message: () => {
    return 'Custom message';
  },
});

const menuSchema = type({
  'id?': type('string'),
  name: type('string>0').configure({
    message: () => 'custom message',
  }),
  tags: type(tagSchema, '[]'),
});

const { r$ } = useRegleSchema(state, menuSchema);

async function submit() {
  const { valid, data } = await r$.$validate();
}
</script>

<template>
  <h2>Hello Regle!</h2>

  <label>Name</label><br />
  <input v-model="r$.$value.name" placeholder="Type your name" />
  <ul style="font-size: 12px; color: red">
    <li v-for="error of r$.$errors.name" :key="error">
      {{ error }}
    </li>
  </ul>

  <label>Email (optional)</label><br />
  <select multiple v-model="r$.$value.tags" placeholder="Type your email">
    <option value="wolt">Wolt</option>
    <option value="eat_inn">Eat in</option>
  </select>
  {{ r$.$errors.tags }}
  <ul style="font-size: 12px; color: red">
    <li v-for="error of r$.$errors.tags" :key="error">
      {{ error }}
    </li>
  </ul>

  <button @click="submit">Submit</button>
  <button @click="r$.$reset()">Reset</button>
  <code class="status"> Form status {{ r$.$correct ? '✅' : '❌' }}</code>
</template>
