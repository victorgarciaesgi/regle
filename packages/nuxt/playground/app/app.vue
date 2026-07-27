<script setup lang="ts">
  import { ref } from 'vue';
  import { useRegle } from '#imports';
  import { useRegleSchema } from '@regle/schemas';
  import { required, minLength, email } from '@regle/rules';
  import { z } from 'zod';

  const rulesState = ref({ name: '', email: '' });
  const schemaState = ref({ name: '', email: '' });

  // Custom useRegle from setupFile (config baked in)
  const { r$: rules$ } = useRegle(rulesState, {
    name: { required, minLength: minLength(4) },
    email: { email },
  });

  // Default useRegleSchema — should inherit modifiers from RegleVuePlugin via setupFile __config
  const { r$: schema$ } = useRegleSchema(
    schemaState,
    z.object({
      name: z.string().min(1, 'Required'),
      email: z.email('Invalid email'),
    })
  );
</script>

<template>
  <h1>Issue #381 — schema global config</h1>
  <p>
    Setup file sets <code>modifiers.autoDirty: false</code>. Typing in either form should <strong>not</strong> set
    <code>$dirty</code> until you touch/validate.
  </p>

  <section style="display: grid; grid-template-columns: 1fr 1fr; gap: 2rem; margin-top: 1.5rem">
    <div>
      <h2>useRegle (setupFile)</h2>
      <label>Name</label><br />
      <input v-model="rules$.$value.name" placeholder="Type your name" />
      <p style="font-size: 12px">
        $dirty: <strong>{{ rules$.name.$dirty }}</strong>
      </p>
      <ul style="font-size: 12px; color: red">
        <li v-for="error of rules$.$errors.name" :key="error">{{ error }}</li>
      </ul>

      <label>Email</label><br />
      <input v-model="rules$.$value.email" placeholder="Type your email" />
      <p style="font-size: 12px">
        $dirty: <strong>{{ rules$.email.$dirty }}</strong>
      </p>
      <ul style="font-size: 12px; color: red">
        <li v-for="error of rules$.$errors.email" :key="error">{{ error }}</li>
      </ul>

      <button @click="rules$.$touch()">Touch</button>
      <button @click="rules$.$reset()">Reset</button>
    </div>

    <div>
      <h2>useRegleSchema (plugin inject)</h2>
      <label>Name</label><br />
      <input v-model="schema$.$value.name" placeholder="Type your name" />
      <p style="font-size: 12px">
        $dirty: <strong>{{ schema$.name.$dirty }}</strong>
      </p>
      <ul style="font-size: 12px; color: red">
        <li v-for="error of schema$.$errors.name" :key="error">{{ error }}</li>
      </ul>

      <label>Email</label><br />
      <input v-model="schema$.$value.email" placeholder="Type your email" />
      <p style="font-size: 12px">
        $dirty: <strong>{{ schema$.email.$dirty }}</strong>
      </p>
      <ul style="font-size: 12px; color: red">
        <li v-for="error of schema$.$errors.email" :key="error">{{ error }}</li>
      </ul>

      <button @click="schema$.$touch()">Touch</button>
      <button @click="schema$.$reset()">Reset</button>
    </div>
  </section>
</template>
