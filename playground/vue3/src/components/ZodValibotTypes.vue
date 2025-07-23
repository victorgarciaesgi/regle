<template>
  <input
    v-model="r$.$value"
    :class="{ error: r$.$error }"
    placeholder="Type your password"
  />
  <ul>
    <li v-for="error of r$.$errors" :key="error">
      {{ error }}
    </li>
  </ul>
  <!-- <input v-model="r$.$value.password" :class="{ error: r$.$fields.password.$error }" placeholder="Type your password" />

  <ul>
    <li v-for="error of r$.$errors.password" :key="error">
      {{ error }}
    </li>
  </ul>

  <input
    v-model="r$.$value.nested.confirm"
    :class="{ error: r$.$fields.nested.$fields.confirm.$error }"
    placeholder="Type your confirm"
  />

  <ul>
    <li v-for="error of r$.$errors.nested.confirm" :key="error">
      {{ error }}
    </li>
  </ul>

  <div v-for="(item, index) of r$.$fields.collection.$each" :key="item.$id" class="item">
    <div class="field">
      <input
        v-model="item.$value.child"
        :class="{ valid: item.$fields.child.$correct, error: item.$fields.child.$error }"
        placeholder="Type an item value"
      />

      <div v-if="r$.$value.collection.length > 1" class="delete" @click="r$.$value.collection.splice(index, 1)">🗑️</div>
    </div>

    <ul v-if="item.$fields.child.$errors.length">
      <li v-for="error of item.$fields.child.$errors" :key="error">
        {{ error }}
      </li>
    </ul>
  </div>

  Array errors:
  <ul v-if="r$.$fields.collection.$errors.$self.length">
    <li v-for="error of r$.$fields.collection.$errors.$self" :key="error">
      {{ error }}
    </li>
  </ul> -->

  <!-- <button type="button" @click="r$.$value.collection.push({ child: '' })">🆕 Add item</button> -->
  <button @click="r$.$reset({ toInitialState: true })">Reset</button>
  <button @click="r$.$validate">Submit</button>
</template>

<script setup lang="ts">
import { useRegleSchema } from '@regle/schemas'
import * as v from 'valibot'
import { ref } from 'vue'
import { z, ZodSchema } from 'zod/v3'
import type { PartialDeep } from 'type-fest'

// const zodSchema = z
//   .object({
//     password: z.string().min(1),
//     nested: z
//       .object({
//         confirm: z
//           .string()
//           .min(1)
//           .refine((value) => value.length > 2, { message: 'Value should > 2' }),
//       })
//       .refine((data) => data.confirm === 'bar', {
//         path: ['confirm'],
//         message: 'Value must be "bar"',
//       }),
//     collection: z
//       .array(
//         z.object({
//           child: z.string().min(1),
//         })
//       )
//       .refine(
//         (arg) => {
//           return arg.every((v) => v.child?.length === 3);
//         },
//         {
//           message: 'All items children length must be min 3',
//         }
//       )
//       .refine((arg) => arg[0].child === 'foo', {
//         message: 'First item must be "foo"',
//         path: ['0', 'child'],
//       }),
//   })
//   .refine((data) => data.nested.confirm === data.password, {
//     path: ['nested', 'confirm'],
//     message: 'Password and confirm must match',
//   });

// const valibotSchema = v.pipe(
//   v.object({
//     password: v.pipe(v.string(), v.minLength(1)),
//     nested: v.pipe(
//       v.object({
//         confirm: v.pipe(
//           v.string(),
//           v.minLength(1),
//           v.check((value) => value.length > 2, 'Value should > 2')
//         ),
//       }),
//       v.rawCheck(({ dataset, addIssue }) => {
//         if (dataset.typed) {
//           if (dataset.value.confirm !== 'bar') {
//             addIssue({
//               path: [
//                 {
//                   key: 'confirm',
//                   type: 'object',
//                   origin: 'value',
//                   input: dataset.value,
//                   value: dataset.value.confirm,
//                 },
//               ],
//               message: 'Value must be "bar"',
//             });
//           }
//         }
//       })
//     ),
//     collection: v.pipe(
//       v.array(
//         v.object({
//           child: v.pipe(v.string(), v.minLength(1)),
//         })
//       ),
//       v.check((arg) => {
//         return arg.every((v) => v.child?.length === 3);
//       }, 'All items children length must be min 3'),
//       v.rawCheck(({ addIssue, dataset }) => {
//         if (dataset.typed) {
//           if (dataset.value[0].child !== 'foo') {
//             addIssue({
//               path: [
//                 {
//                   key: 0,
//                   type: 'array',
//                   origin: 'value',
//                   input: dataset.value,
//                   value: dataset.value[0],
//                 },
//                 {
//                   key: 'child',
//                   type: 'object',
//                   origin: 'value',
//                   input: dataset.value[0],
//                   value: dataset.value[0].child,
//                 },
//               ],
//               message: 'First item must be "foo"',
//             });
//           }
//         }
//       })
//     ),
//   }),
//   v.rawCheck(({ dataset, addIssue }) => {
//     if (dataset.typed) {
//       if (dataset.value.nested.confirm !== dataset.value.password) {
//         addIssue({
//           path: [
//             {
//               key: 'nested',
//               type: 'object',
//               origin: 'value',
//               input: dataset.value,
//               value: dataset.value.nested,
//             },
//             {
//               key: 'confirm',
//               type: 'object',
//               origin: 'value',
//               input: dataset.value.nested,
//               value: dataset.value.nested.confirm,
//             },
//           ],
//           message: 'Password and confirm must match',
//         });
//       }
//     }
//   })
// );

const name = ref('')
const { r$ } = useRegleSchema(name, z.string().min(2))
</script>

<style lang="scss" scoped></style>
