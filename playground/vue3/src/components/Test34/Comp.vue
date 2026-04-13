<script setup>
  import { ref } from 'vue';
  import { useStore } from './store';
  import { required } from '@regle/rules';

  const store = useStore();
  const name = ref('');

  const formData = { name };
  const rules = { name: { required } };

  const { r$ } = useStore().useForm(formData, rules);

  const validate = () => {
    r$.$validate();
  };
</script>

<template>
  <input v-model="r$.name.$value" placeholder="Type your name" />
  <button @click="validate">Validate</button>
  <p>Errors: {{ r$.$errors }}</p>
  <p>Edited state: {{ r$.$anyEdited }}</p>
</template>
