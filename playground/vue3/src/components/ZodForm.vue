<template>
  <div style="display: flex; flex-flow: column wrap; width: 500px; overflow: auto">
    <input v-model="form.email" placeholder="email" />

    <ul>
      <li v-for="error of r$.$errors.email" :key="error">{{ error }}</li>
    </ul>

    <input v-model="form.firstName" placeholder="firstname" />
    <ul>
      <li v-for="error of r$.$errors.firstName" :key="error">{{ error }}</li>
    </ul>

    <select v-if="r$.$fields.gift" v-model="r$.$fields.gift.$fields.type">
      <option value="Cash">Cash</option>
      <option value="Shares">Shares</option>
    </select>

    <template v-for="(input, index) of form.nested" :key="index">
      <input v-model="input.name" placeholder="name" />
      <ul>
        <!-- TODO types for collections errors -->
        <li v-for="error of r$.$errors.nested.$each[index].name" :key="error">
          {{ error }}
        </li>
      </ul>
    </template>

    <button type="submit" @click="form.nested.push({ name: '' })"> Add entry </button>
    <button type="submit" @click="form.nested.splice(0, 1)"> Remove first </button>
    <button type="submit" @click="submit">Submit</button>

    <pre style="max-width: 100%">
      <code>
{{ r$ }}
      </code>
    </pre>
  </div>
</template>

<script setup lang="ts">
import type { Maybe, RegleExternalErrorTree } from '@regle/core';
import { useZodRegle } from '@regle/zod';
import { nextTick, reactive, ref } from 'vue';
import { z } from 'zod';

type Form = {
  enum: 'Salmon' | 'Tuna' | 'Trout';
  email: string | number;
  firstName?: number;
  discri?: { status: 'success'; data: string } | { status: 'failed'; error: Error };
  nested: [{ name: string }];
  gift?: z.infer<typeof Gift>;
};

const form = reactive<Form>({
  email: '',
  enum: 'Salmon',
  firstName: 0,
  nested: [{ name: '' }],
});

async function submit() {
  const { result, data } = await r$.$validate();
}

const externalErrors = ref<RegleExternalErrorTree<Form>>({
  email: [''],
});

const GiftType = z.enum(['Cash', 'Shares'], {
  required_error: 'Please select an option',
});

const CashGift = z.object({
  type: z.literal(GiftType.Values.Cash),
  amount: z.number().nonnegative().finite(),
});

const SharesGift = z.object({
  type: z.literal(GiftType.Values.Shares),
  shares: z
    .number({
      invalid_type_error: 'Shares must be a number',
    })
    .int()
    .nonnegative('Must be a positive number')
    .finite(),
  company: z
    .string({
      required_error: "Company can't be empty",
    })
    .nonempty("Company can't be empty"),
});
const Gift = z.discriminatedUnion('type', [CashGift, SharesGift], { description: 'Gift' });

type foo = typeof Gift extends z.ZodDiscriminatedUnion<any, infer U> ? U[number] : never;

const { r$ } = useZodRegle(
  form,
  z.object({
    enum: z.enum(['Salmon', 'Tuna', 'Trout']),
    email: z.union([z.string(), z.number()]),
    discri: z.discriminatedUnion('status', [
      z.object({ status: z.literal('success'), data: z.string() }),
      z.object({ status: z.literal('failed'), error: z.instanceof(Error) }),
    ]),
    gift: Gift,
    firstName: z.coerce.number({ invalid_type_error: 'Not a number', required_error: 'Bite' }).optional(),
    nested: z
      .array(
        z.object({
          name: z.string().min(1, 'Required'),
        })
      )
      .catch([]),
  }),
  { externalErrors }
);
</script>
