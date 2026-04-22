<script setup lang="ts">
  import { useRegleSchema } from '@regle/schemas';
  import { z } from 'zod';

  import EmailComponent from './EmailComponent.vue';

  const emailSchema = z.discriminatedUnion('id', [
    z.object({
      id: z.literal(1),
      label: z.literal('private'),
    }),
    z.object({
      id: z.literal(2),
      label: z.literal('business'),
    }),
  ]);

  export type Email = z.infer<typeof emailSchema>;

  const emailOptions = emailSchema.options.map(
    (option) =>
      ({
        id: option.shape.id.value,
        label: option.shape.label.value,
      }) as Email
  );

  const formSchema = z.object({
    email: emailSchema.nullable().transform((val) => val!),
  });

  const { r$ } = useRegleSchema({ email: null }, formSchema);

  async function submit() {
    const { valid, data, errors } = await r$.$validate();

    if (valid) {
      console.log(data.email.id);
      console.log(data.email.label);
    } else {
      console.warn('Errors: ', errors);
    }
  }
</script>

<template>
  <h2>Hello Regle!</h2>

  <EmailComponent v-model="r$.$value.email" :field="r$.email" :options="emailOptions" />

  <button @click="submit()">Submit</button>
  <button @click="r$.$reset({ toInitialState: true })">Restart</button>
  <code class="status"> Form status {{ r$.$correct ? '✅' : '❌' }}</code>
</template>
