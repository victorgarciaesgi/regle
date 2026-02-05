<template>
  <div class="demo-container">
    <div class="block">
      <h5>Email (r$)</h5>
      <input
        v-model="r$Merged.$value.r$.email"
        :class="{ valid: r$Merged.r$.email.$correct, error: r$Merged.r$.email.$error }"
        placeholder="Email"
      />
      <ul v-if="r$Merged.$errors.r$.email.length">
        <li v-for="error of r$Merged.$errors.r$.email" :key="error">{{ error }}</li>
      </ul>
    </div>

    <div class="block">
      <h5>First name (otherR$)</h5>
      <input
        v-model="r$Merged.$value.otherR$.firstName"
        :class="{ valid: r$Merged.otherR$.firstName.$correct, error: r$Merged.otherR$.firstName.$error }"
        placeholder="First name"
      />
      <ul v-if="r$Merged.$errors.otherR$.firstName.length">
        <li v-for="error of r$Merged.$errors.otherR$.firstName" :key="error">{{ error }}</li>
      </ul>
    </div>

    <div class="actions">
      <button type="button" @click="r$Merged.$reset({ toInitialState: true })">Reset All</button>
      <button class="primary" type="button" @click="r$Merged.$validate()">Validate All</button>
      <code class="status" :status="r$Merged.$correct"></code>
    </div>

    <div class="info">
      <p>Merged validation state:</p>
      <div>
        <div>$invalid: {{ r$Merged.$invalid }}</div>
        <div>$error: {{ r$Merged.$error }}</div>
        <div>$pending: {{ r$Merged.$pending }}</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { mergeRegles, useRegle } from '@regle/core';
  import { required, email } from '@regle/rules';

  const { r$ } = useRegle(
    { email: '' },
    {
      email: { required, email },
    }
  );

  const { r$: otherR$ } = useRegle(
    { firstName: '' },
    {
      firstName: { required },
    }
  );

  const r$Merged = mergeRegles({ r$, otherR$ });
</script>
