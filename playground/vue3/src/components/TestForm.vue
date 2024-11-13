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
    <input v-model="state.name" placeholder="name" />

    <ul>
      <li v-for="error of errors.name" :key="error">
        {{ error }}
      </li>
    </ul>
    <!-- <br />
    <template :key="index" v-for="(input, index) of form.array0">
      <input v-model="form.array0[index]" placeholder="name" />
      <ul>
        <li :key="index2" v-for="(error, index2) of errors.array0.$each[index]">{{ error }}</li>
      </ul>
    </template>

    <button type="submit" @click="form.array0?.push(null)">Add entry</button>
    <button type="submit" @click="form.array0.splice(0, 1)">Remove first</button> -->

    <!-- <template v-for="(input, index) of form.array2" :key="index">
      <input v-model="form.array2[index].name" placeholder="name" />
      <input v-model="form.array2[index].deleted" type="checkbox" />
      <ul>
        <li v-for="(error, index2) of errors.array2.$each[index].name" :key="index2">
          {{ error }}
        </li>
      </ul>
    </template>

    <button type="submit" @click="form.array2?.push({ name: '', deleted: false })">
      Add entry
    </button>
    <button type="submit" @click="form.array2 = form.array2.filter((f) => f.name.length > 2)">
      Remove first
    </button>

    <button type="submit" @click="resetAll"> reset </button>
    <button type="submit" @click="submit"> Submit </button> -->

    <pre>
        <code>
 <!-- {{ errors }} -->
{{ regle }}
        
      </code>
    </pre>
  </div>
</template>

<script setup lang="ts">
import type { Maybe, InlineRuleDeclaration } from '@regle/core';
import {
  createRule,
  defineType,
  RegleExternalErrorTree,
  RegleFieldStatus,
  useRegle,
} from '@regle/core';
import {
  minLength,
  numeric,
  required,
  requiredIf,
  withAsync,
  withMessage,
  withParams,
} from '@regle/rules';
import { nextTick, reactive, ref } from 'vue';
import { timeout } from './../validations';

const form = reactive({
  name: '',
  // array0: [null] as (number | null)[],
  // nested: {
  //   array1: null as string[] | null,
  // },
  parents: [{ skills: [{ items: [{ name: '' }] }] }],
});

async function submit() {
  // regle.$value.count = 2;
  const result = await validateState();
  console.log(result);
}

const { errors, validateState, regle, resetAll, invalid, state } = useRegle(form, () => ({
  // name: {
  //   required: withParams(
  //     (value) => {
  //       console.log(value);
  //       return { $valid: form.array2[0].name !== 'test', foo: form.array2[0].name };
  //     },
  //     [() => form.array2[0].name]
  //   ),
  // },
  // array0: { $each: { numeric: numeric } },
  // nested: {
  //   array1: { $each: { minLength: minLength(2) } },
  // },
  parents: {
    $each: (parent) => ({
      skills: {
        $each: (skill) => ({
          items: {
            $each: (item, index) => {
              console.log(parent, skill, item);
              return {
                name: { required: () => ({ $valid: true, foo: skill }) },
              };
            },
          },
        }),
      },
    }),
  },
}));

// regle.$fields.array2.$each[0].$fields.name.$rules.valid.$metadata.foo;

// form.nested.array1 = ['b'];
// nextTick(async () => {
//   regle.$fields.nested.$fields.array1.$each[0].$touch();

//   const result = await validateState();
//   if (result) {
//     // TODO bug never
//     result.nested.array1;
//   }
// });
</script>
