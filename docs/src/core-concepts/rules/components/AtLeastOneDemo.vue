<template>
  <div class="demo-container">
    <div class="demo-field-input">
      <label>Delete fields to trigger the error:</label>
    </div>
    <pre>{{ r$.$value }}</pre>
    <div>
      <DemoField
        v-model="r$.$value.user.firstName"
        :field="r$.user.firstName"
        label="First name"
        placeholder="First name"
      />
    </div>
    <br />
    <DemoField v-model="r$.$value.user.lastName" :field="r$.user.lastName" label="Last name" placeholder="Last name" />
    <ul v-if="r$.user.$self?.$errors.length">
      <li v-for="error of r$.user.$self.$errors" :key="error">{{ error }}</li>
    </ul>
  </div>
</template>

<script setup lang="ts">
  import DemoField from './DemoField.vue';
  import { useRegle } from '@regle/core';
  import { atLeastOne } from '@regle/rules';

  type User = {
    firstName?: string;
    lastName?: string;
  };

  const { r$ } = useRegle(
    { user: { firstName: '', lastName: '' } as User },
    {
      user: {
        $self: { atLeastOne: atLeastOne(['firstName', 'lastName']) },
      },
    }
  );
</script>
