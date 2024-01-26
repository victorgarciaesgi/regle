<template>
  <div style="display: flex; flex-flow: column wrap; width: 500px; overflow: auto">
    <!-- <input :value="form.email" @input="updateEmail" placeholder="email" />
    <span v-if="$regle.$fields.email.$pending" style="color: orange">Loading</span>
    <ul>
      <li v-for="error of $errors.email" :key="error">{{ error }}</li>
    </ul>

    <input v-model.number="limit" placeholder="limit" />

    <input
      :value="form.firstName"
      @input="updateFirstName"
      :placeholder="`firstName ${$regle.$fields.firstName.$rules.required?.$active ? '*' : ''}`"
    />
    <ul>
      <li v-for="error of $errors.firstName" :key="error">{{ error }}</li>
    </ul>

    <input type="date" v-model="form.birthDate" placeholder="Birth date" />
    <ul>
      <li v-for="error of $errors.birthDate" :key="error">{{ error }}</li>
    </ul>

    <input type="date" v-model="form.today" placeholder="Today" />
    <ul>
      <li v-for="error of $errors.today" :key="error">{{ error }}</li>
    </ul>

    <template :key="index" v-for="(input, index) of form.foo.bloublou.test">
      <input v-model="input.name" placeholder="name" />
      <ul>
        <li v-for="error of $errors.foo.bloublou.test.$each[index].name" :key="error">{{
          error
        }}</li>
      </ul>
    </template>

    <button type="submit" @click="form.foo.bloublou.test.push({ name: '' })">Add entry</button>
    <button type="submit" @click="form.foo.bloublou.test.splice(0, 1)">Remove first</button>
    <button type="submit" @click="submit">Submit</button>

    <pre style="max-width: 100%">
      <code>
{{ $errors }}
{{ $regle }}
      </code>
    </pre>
  </div> -->
    <input v-model="form.count" placeholder="count" />

    <input v-model="form.email" placeholder="email" />
    <span v-if="$regle.$fields.email.$pending" style="color: orange">Loading</span>
    <ul>
      <li v-for="error of $errors.email" :key="error">{{ error }}</li>
    </ul>

    <pre><code>{{ $regle }}
    {{ $errors }}</code></pre>
    <button type="submit" @click="submit">Submit</button>
  </div>
</template>

<script setup lang="ts">
import { RegleExternalErrorTree } from '@regle/core';
import { minLength, required, withMessage } from '@regle/validators';
import { reactive, ref } from 'vue';
import { timeout, useRegle } from './../validations';
import { withAsync } from '@regle/validators';

const form = ref({
  email: '',
  count: 0,
});

function submit() {
  validateForm();
}

const { $errors, validateForm, $regle } = useRegle(form, () => ({
  email: {
    error: withAsync(
      async (value) => {
        await timeout(1000);
        return form.value.count === 0;
      },
      [() => form.value.count]
    ),
  },
}));
</script>
