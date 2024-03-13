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
   

    <button type="submit" @click="form.nested.array1?.push('')">Add entry</button>
    <button type="submit" @click="form.nested.array1?.splice(0, 1)">Remove first</button> -->
    <br />
    <template :key="index" v-for="(input, index) of form.nested.array1">
      <input v-model="form.nested.array1[index]" placeholder="name" />
      <ul>
        <li :key="index2" v-for="(error, index2) of errors.nested.array1.$each[index]">{{
          error
        }}</li>
      </ul>
    </template>

    <button type="submit" @click="form.nested.array1?.push('e')">Add entry</button>
    <button type="submit" @click="form.nested.array1?.shift()">Remove first</button>

    <template :key="index" v-for="(input, index) of form.array2">
      <input v-model="form.array2[index].name" placeholder="name" />
      <ul>
        <li :key="index2" v-for="(error, index2) of errors.array2.$each[index].name">{{
          error
        }}</li>
      </ul>
    </template>

    <button type="submit" @click="form.array2?.push({ name: '' })">Add entry</button>
    <button type="submit" @click="form.array2?.splice(0, 1)">Remove first</button>

    <button type="submit" @click="resetForm">reset</button>
    <button type="submit" @click="submit">Submit</button>

    <pre>
        <code>

{{ regle.$fields.nested.$fields.array1 }}
        
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

const form = reactive({
  array0: [0] as number[],
  nested: {
    array1: ['foo', 'e', 'a'] as string[],
  },
  array2: [{ name: '' }],
});

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
  array2: { $each: { name: { required } } },
}));
</script>
