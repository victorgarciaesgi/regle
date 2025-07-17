<template>
  <div class="demo-container">
    <div class="row">
      <div>
        <input
          v-model="form.email"
          :class="{ valid: r$.email.$correct, error: r$.email.$error }"
          placeholder="Type your email"
        />

        <ul v-if="r$.$errors.email.length">
          <li v-for="error of r$.$errors.email" :key="error">
            {{ error }}
          </li>
        </ul>
      </div>

      <div>
        <input
          v-model="form.name.pseudo"
          :class="{
            valid: r$.name.$correct,
            error: r$.name.pseudo.$error,
          }"
          placeholder="Type your pseudo"
        />

        <ul v-if="r$.$errors.name.pseudo.length">
          <li v-for="error of r$.$errors.name.pseudo" :key="error">
            {{ error }}
          </li>
        </ul>
      </div>

      <div
        v-for="(item, index) of r$.collection.$each"
        :key="item.$id"
        class="item"
      >
        <div class="field">
          <input
            v-model="item.$value.name"
            :class="{ valid: item.name.$correct, error: item.name.$error }"
            placeholder="Type an item value"
          />

          <div
            v-if="form.collection.length > 1"
            class="delete"
            @click="form.collection.splice(index, 1)"
          >
            🗑️
          </div>
        </div>

        <ul v-if="item.name.$errors.length">
          <li v-for="error of item.name.$errors" :key="error">
            {{ error }}
          </li>
        </ul>
      </div>
    </div>
    <div class="button-list">
      <button type="button" @click="r$.$clearExternalErrors">
        Reset external Errors
      </button>
      <button
        type="button"
        @click="
          () => r$.$reset({ toInitialState: true, clearExternalErrors: true })
        "
      >
        Reset All
      </button>
      <button class="primary" type="button" @click="submit">Submit</button>
      <code class="status" :status="r$.$correct"></code>
    </div>
  </div>
</template>

<script setup lang="ts">
import { required } from '@regle/rules'
import { ref, reactive } from 'vue'
import { type RegleExternalErrorTree, useRegle } from '@regle/core'

const form = ref({
  email: '',
  name: {
    pseudo: '',
  },
  collection: [
    {
      name: '',
    },
  ],
})

const externalErrors = ref({})

const { r$ } = useRegle(
  form,
  {
    email: { required },
    name: { pseudo: { required } },
    collection: {
      $each: {
        name: { required },
      },
    },
  },
  {
    externalErrors,
  },
)

function submit() {
  r$.$validate()
  externalErrors.value = {
    email: ['Email already exists'],
    'name.pseudo': ['Hello'],
    'collection.0.name': ['Ouiii'],
  }
}
</script>
