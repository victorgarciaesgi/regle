<template>
  <div style="display: flex; flex-flow: column wrap; width: 500px; overflow: auto">
    <!-- <input :value="form.email" @input="updateEmail" placeholder="email" />
    <span v-if="regle.$fields.email.$pending" style="color: orange">Loading</span>
    <ul>
      <li v-for="error of errors.email" :key="error">{{ error }}</li>
    </ul>

    <input v-model.number="limit" placeholder="limit" />

    <input
      :value="form.firstName"
      @input="updateFirstName"
      :placeholder="`firstName ${regle.$fields.firstName.$rules.required?.$active ? '*' : ''}`"
    />
    <ul>
      <li v-for="error of errors.firstName" :key="error">{{ error }}</li>
    </ul>

    <input type="date" v-model="form.birthDate" placeholder="Birth date" />
    <ul>
      <li v-for="error of errors.birthDate" :key="error">{{ error }}</li>
    </ul>

    <input type="date" v-model="form.today" placeholder="Today" />
    <ul>
      <li v-for="error of errors.today" :key="error">{{ error }}</li>
    </ul>

    <template :key="index" v-for="(input, index) of form.foo.bloublou.test">
      <input v-model="input.name" placeholder="name" />
      <ul>
        <li v-for="error of errors.foo.bloublou.test.$each[index].name" :key="error">{{
          error
        }}</li>
      </ul>
    </template>

    <button type="submit" @click="form.foo.bloublou.test.push({ name: '' })">Add entry</button>
    <button type="submit" @click="form.foo.bloublou.test.splice(0, 1)">Remove first</button>
    <button type="submit" @click="submit">Submit</button>

    <pre style="max-width: 100%">
      <code>
{{ errors }}
{{ regle }}
      </code>
    </pre>
  </div> -->
    <!-- <input v-model.number="form.count.value" placeholder="count" />

    <input v-model="form.email.value" placeholder="email" /> -->
    <!-- <span v-if="regle.$fields.email.$pending" style="color: orange">Loading</span>
    <ul>
      <li v-for="error of errors.email" :key="error">{{ error }}</li>
    </ul> -->
    <!-- 
    <template :key="index" v-for="(input, index) of form.nested.foo">
      <input v-model="form.nested.foo[index]" placeholder="name" />
    </template>
    <ul>
      <li :key="index" v-for="(error, index) of errors.nested.foo.$errors">{{ error }}</li>
    </ul>

    <button type="submit" @click="form.nested.foo.push('')">Add entry</button>
    <button type="submit" @click="form.nested.foo.splice(0, 1)">Remove first</button> -->
    <br />
    <button type="submit" @click="resetForm">reset</button>
    <button type="submit" @click="submit">Submit</button>

    <pre>
        <code>
{{ errors }}
{{ regle }}
        
      </code>
    </pre>
  </div>
</template>

<script setup lang="ts">
import { RegleExternalErrorTree } from '@regle/core';
import { minLength, numeric, required, withMessage } from '@regle/validators';
import { reactive, ref } from 'vue';
import { timeout, useRegle } from './../validations';
import { withAsync } from '@regle/validators';
import { maxLength } from '@regle/validators';

const form = {
  array0: [] as number[],
  nested: {
    array1: null as null | string[],
  },
};

async function submit() {
  // regle.$value.count = 2;
  const result = await validateForm();
  // console.log(result);
}

const { errors, validateForm, regle, resetForm, invalid } = useRegle(form, () => ({
  array0: { $each: { numeric: numeric } },
  nested: {
    array1: { required, $each: { minLength: minLength(2) } },
  },
}));
</script>
