<template>
  <div class="demo-container">
    <div>
      <div>
        <input v-model="form.level1.child.value" placeholder="Type an item value" />
      </div>
    </div>
    <button type="button" @click="resetAll">Reset</button>

    <pre>{{ regle }}</pre>
  </div>
</template>

<script setup lang="ts">
import { useRegle } from '@regle/core';
import { ref } from 'vue';
import { required } from '@regle/rules';

const form = {
  level0: ref(0),
  level1: {
    child: ref(1),
    level2: {
      child: ref(2),
    },
  },
};

const { regle, resetAll } = useRegle(form, {
  level0: {
    required,
  },
});
</script>

<style lang="scss"></style>
