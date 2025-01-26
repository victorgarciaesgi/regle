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
      <div v-if="r$.$fields.gift?.$fields?.type.$error" class="text-red-500 mt-2 text-sm">
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

    <template v-for="(input, index) of form.nested" :key="index">
      <input v-model="input.name" placeholder="name" />
      <ul>
        <li v-for="error of r$.$errors.nested?.$each[index].name" :key="error">
          {{ error }}
        </li>
      </ul>
    </template>

    <ul>
      Array:
      <li v-for="error of r$.$errors.nested?.$self" :key="error">
        {{ error }}
      </li>
    </ul>

    <button type="submit" @click="form.nested?.push({ name: '' })"> Add entry </button>
    <button type="submit" @click="form.nested?.splice(0, 1)"> Remove first </button>
    <button type="submit" @click="r$.$reset">Reset</button>
    <button type="submit" @click="submit">Submit</button>

    <pre style="max-width: 100%">
      <code>
 {{ r$ }}
      </code>
    </pre>
  </div>
</template>

<script setup lang="ts">
import { useRegleSchema } from '@regle/schemas';
import * as v from 'valibot';
import { reactive } from 'vue';

const GiftType = v.picklist(['Cash', 'Shares'], 'Please select an option');

enum MyEnum {
  Foo = 'Foo',
  Bar = 'Bar',
}

enum MyEnum2 {
  Foo2 = 'Foo',
  Bar2 = 'Bar',
}

const CashGift = v.object({
  type: v.literal(GiftType.options[0]),
  amount: v.pipe(v.number(), v.minValue(0), v.finite()),
});

const SharesGift = v.object({
  type: v.literal(GiftType.options[1]),
  shares: v.pipe(
    v.number('Shares must be a number'),
    v.integer(),
    v.minValue(0, 'Must be a positive number'),
    v.finite()
  ),
  company: v.pipe(v.string(), v.nonEmpty("Company can't be empty")),
});

const Gift = v.variant('type', [CashGift, SharesGift]);

const Dateish = v.pipe(
  v.string(),
  v.transform((x) => {
    return x && typeof x === 'string' ? new Date(x) : x;
  }),
  v.date('Please provide a valid date')
);

const formSchema = v.intersect([
  v.object({
    email: v.union([v.number(), v.string()]),
    discri: v.variant('status', [
      v.object({ status: v.literal('success'), data: v.string() }),
      v.object({ status: v.literal('failed'), error: v.instance(Error) }),
    ]),
    gift: Gift,
    people: v.object({
      person1: v.nullish(v.object({ fullName: v.string() })),
      person2: v.nullish(v.object({ fullName: v.string() })),
    }),
    date: Dateish,
    firstName: v.pipe(v.string(), v.transform(Number), v.number('Not a number')),
    nested: v.pipe(
      v.array(
        v.object({
          name: v.pipe(v.string(), v.minLength(3, 'Min Length : 3')),
        })
      ),
      v.minLength(2)
    ),
  }),
  v.object({ enum: v.picklist(['Salmon', 'Tuna', 'Trout']) }),
  v.object({ nativeEnum: v.enum(MyEnum) }),
]);

const form = reactive<Partial<v.InferInput<typeof formSchema>>>({
  gift: {} as any,
  nested: [],
});

const { r$ } = useRegleSchema(form, formSchema, { mode: 'rules' });

async function submit() {
  const { result, data } = await r$.$validate();
  if (result) {
  }
}
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
