<template>
  Zod
  <div style="display: flex; flex-flow: column wrap; width: 500px; overflow: auto">
    <input v-model="form.nativeEnum" placeholder="nativeEnum" />

    <ul>
      <li v-for="error of r$.$errors.nativeEnum" :key="error">{{ error }}</li>
    </ul>

    <input v-model="form.firstName" placeholder="firstname" />
    <ul>
      <li v-for="error of r$.$errors.firstName" :key="error">{{ error }}</li>
    </ul>

    <input v-model="form.date" placeholder="date" />
    <ul>
      <li v-for="error of r$.$errors.date" :key="error">{{ error }}</li>
    </ul>

    Gift:

    <select v-if="r$.$value.gift" v-model="r$.$value.gift.type">
      <option value="">Select a value</option>
      <option value="Cash">Cash</option>
      <option value="Shares">Shares</option>
    </select>
    <Transition mode="out-in" name="fade">
      <div v-if="r$.$fields.gift?.$fields.type.$error" class="text-red-500 mt-2 text-sm">
        <ul>
          <li v-for="error of r$.$errors.gift?.type" :key="error">{{ error }}</li>
        </ul>
      </div>
    </Transition>

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

    <template v-for="(field, index) of r$.$fields.nested?.$each" :key="index">
      <input v-model="field.$value.name" placeholder="name" />
      <ul>
        <li v-for="error of r$.$errors.nested?.$each[index].name" :key="error">
          {{ error }}
        </li>
      </ul>
    </template>

    <button type="submit" @click="form.nested?.push({ name: '' })"> Add entry </button>
    <button type="submit" @click="form.nested?.splice(0, 1)"> Remove first </button>
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
import { useRegleSchema } from '@regle/schemas';
import { useZodRegle } from '@regle/zod';
import { nextTick, reactive, ref, watch } from 'vue';
import {
  nativeEnum,
  z,
  type mergeTypes,
  type objectOutputType,
  type ZodDiscriminatedUnionOption,
  type ZodIntersectionDef,
  type ZodObjectDef,
} from 'zod';

enum MyEnum {
  Foo = 'Foo',
  Bar = 'Bar',
}

enum MyEnum2 {
  Foo2 = 'Foo',
  Bar2 = 'Bar',
}

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

const Dateish = z.preprocess(
  (x) => {
    return x && typeof x === 'string' ? new Date(x) : x;
  },
  z.date({
    required_error: 'Please provide a valid date',
    invalid_type_error: 'Please provide a valid date',
  })
);

const formSchema = z
  .object({
    email: z.union([z.number(), z.string()]),
    discri: z
      .discriminatedUnion('status', [
        z.object({ status: z.literal('success'), data: z.string() }),
        z.object({ status: z.literal('failed'), error: z.instanceof(Error) }),
      ])
      .optional(),
    gift: Gift,
    people: z.object({
      person1: z.object({ fullName: z.string() }).nullish(),
      person2: z.object({ fullName: z.string() }).nullish(),
    }),
    date: Dateish,
    firstName: z.coerce.number({ invalid_type_error: 'Not a number', required_error: 'Bite' }).optional(),
    donors: z.array(
      z.object({
        id: z.string(),
        name: z.string(),
        address: z.string(),
        job: z.string(),
      })
    ),
    nested: z
      .array(
        z.object({
          name: z.string().min(3, 'Min Length : 3'),
        })
      )
      .min(1),
  })
  .and(z.object({ enum: z.enum(['Salmon', 'Tuna', 'Trout']) }))
  .and(z.object({ nativeEnum: z.nativeEnum(MyEnum) }));

const form = reactive<Partial<z.infer<typeof formSchema>>>({
  gift: {} as any,
  nested: [],
});

async function submit() {
  const { result, data } = await r$.$validate();
  console.log(result);
  console.log(r$.$errors);
}

const { r$ } = useRegleSchema(form, formSchema);
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 1s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
