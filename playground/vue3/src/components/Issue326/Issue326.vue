<script setup lang="ts">
  import { useRegleSchema } from '@regle/schemas';
  import { z } from 'zod';
  import { ref } from 'vue';

  import EmailComponent from './EmailComponent.vue';

  const emailIdSchema = z.number().brand<'emailId'>();

  const emailSchema = z.object({
    id: emailIdSchema,
    label: z.string(),
  });

  export type Email = z.infer<typeof emailSchema>;
  export type EmailInput = z.input<typeof emailSchema>;

  const emailOptions: Email[] = [
    {
      id: emailIdSchema.parse(1),
      label: 'private',
    },
    {
      id: emailIdSchema.parse(2),
      label: 'business',
    },
  ];

  const emailOptionsInput: EmailInput[] = [
    {
      id: 1,
      label: 'private',
    },
    {
      id: 2,
      label: 'business',
    },
  ];

  const formSchema = z.object({
    email: emailSchema.nullable().transform((val) => val!),
  });

  const state = ref<z.input<typeof formSchema>>({ email: null });

  const { r$ } = useRegleSchema(state, formSchema);

  r$.$fields.email;

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

  <EmailComponent v-model="r$.email.$value" :field="r$.email" name="Email" :options="emailOptions" />

  <ul v-if="r$.$value.email !== null">
    <li>
      id: <b>{{ r$.$value.email.id }}</b>
    </li>
    <li>
      label: <b>{{ r$.$value.email.label }}</b>
    </li>
  </ul>

  <button @click="submit()">Submit</button>
  <button @click="r$.$reset({ toInitialState: true })">Restart</button>
  <code class="status"> Form status {{ r$.$correct ? '✅' : '❌' }}</code>
</template>
