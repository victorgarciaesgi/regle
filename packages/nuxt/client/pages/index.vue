<script setup lang="ts">
  import { CustomInspector } from '@vue/devtools-applet';
  import { REGLE_DEVTOOLS_PLUGIN_ID } from '@regle/core';
  import { ref } from 'vue';
  import { setupRegleVueDevtoolsRpcBridge } from '../utils/vue-devtools-rpc-bridge';
  import '@vue/devtools-applet/style.css';

  const connected = ref(false);
  const loadError = ref(false);

  setupRegleVueDevtoolsRpcBridge()
    .then(() => {
      connected.value = true;
    })
    .catch(() => {
      loadError.value = true;
    });
</script>

<template>
  <div class="relative h-screen w-full flex flex-col n-bg-base">
    <CustomInspector
      v-if="connected"
      id="regle-inspector"
      :plugin-id="REGLE_DEVTOOLS_PLUGIN_ID"
      @load-error="loadError = true"
    />
    <div v-else-if="loadError" class="h-full flex items-center justify-center p-8">
      <NTip n="yellow">
        Failed to connect to Regle. Make sure Regle is installed and the app is running in development mode.
      </NTip>
    </div>
    <div v-else class="h-full flex items-center justify-center">
      <NLoading> Connecting to Regle... </NLoading>
    </div>
  </div>
</template>
