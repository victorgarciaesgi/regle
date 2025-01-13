<template>
  <div style="display: flex; flex-flow: column wrap; width: 500px; overflow: auto">
    <input v-model="form.nativeEnum" placeholder="nativeEnum" />

    <ul>
      <li v-for="error of r$.$errors.nativeEnum" :key="error">{{ error }}</li>
    </ul>

    <input v-model="form.firstName" placeholder="firstname" />
    <ul>
      <li v-for="error of r$.$errors.firstName" :key="error">{{ error }}</li>
    </ul>

    Gift:

    <select v-if="r$.$value.gift" v-model="r$.$value.gift.type">
      <option disabled value="">Select a value</option>
      <option value="Cash">Cash</option>
      <option value="Shares">Shares</option>
    </select>
    <ul>
      <li v-for="error of r$.$errors.gift?.type" :key="error">{{ error }}</li>
    </ul>

    <template v-if="r$.$value.gift?.type === 'Cash'">
      <input v-model.number="r$.$value.gift.amount" placeholder="amount" />
      <ul>
        <li v-for="error of r$.$errors.gift?.amount" :key="error">{{ error }}</li>
      </ul>
    </template>
    <template v-else-if="r$.$value.gift?.type === 'Shares'">
      <input v-model="r$.$value.gift.company" placeholder="company" />
      <ul>
        <li v-for="error of r$.$errors.gift?.company" :key="error">{{ error }}</li>
      </ul>
      <input v-model.number="r$.$value.gift.shares" placeholder="shares" />
      <ul>
        <li v-for="error of r$.$errors.gift?.shares" :key="error">{{ error }}</li>
      </ul>
    </template>

    <!-- <template v-for="(input, index) of form.nested" :key="index">
      <input v-model="input.name" placeholder="name" />
      <ul>
        <li v-for="error of r$.$errors.nested.$each[index].name" :key="error">
          {{ error }}
        </li>
      </ul>
    </template> -->

    <button type="submit" @click="form.nested.push({ name: '' })"> Add entry </button>
    <button type="submit" @click="form.nested.splice(0, 1)"> Remove first </button>
    <button type="submit" @click="submit">Submit</button>

    <pre style="max-width: 100%">
      <code>
Gift field: {{ r$.$fields.gift }}
      </code>
    </pre>
  </div>
</template>

<script setup lang="ts">
import type { Maybe, RegleExternalErrorTree } from '@regle/core';
import { useZodRegle } from '@regle/zod';
import { nextTick, reactive, ref } from 'vue';
import { nativeEnum, z } from 'zod';

enum MyEnum {
  Foo = 'Foo',
  Bar = 'Bar',
}

enum MyEnum2 {
  Foo2 = 'Foo',
  Bar2 = 'Bar',
}

type Form = {
  enum: 'Salmon' | 'Tuna' | 'Trout';
  email: string | number;
  firstName?: number;
  discri?: { status: 'success'; data: string } | { status: 'failed'; error: Error };
  nested: [{ name: string }];
  gift: z.infer<typeof Gift>;
  nativeEnum?: MyEnum;
};

const form = reactive<Form>({
  email: '',
  enum: 'Salmon',
  firstName: 0,
  nested: [{ name: '' }],
  gift: {} as any,
});

async function submit() {
  const { result, data } = await r$.$validate();
  console.log(result);
  console.log(r$.$errors);
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

const { r$ } = useZodRegle(
  form,
  z.object({
    enum: z.enum(['Salmon', 'Tuna', 'Trout']),
    nativeEnum: z.nativeEnum(MyEnum),
    email: z.union([z.number(), z.string()]),
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
