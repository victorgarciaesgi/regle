import { createBirpcGroup } from 'birpc';
import { defineNuxtPlugin } from 'nuxt/app';
import { createRegleDevtoolsHostChannel } from '../utils/regle-devtools-channel';
import {
  createRegleDevtoolsRpcFunctions,
  setupRegleDevtoolsChangeBroadcast,
} from '../utils/regle-devtools-rpc-functions';

export default defineNuxtPlugin({
  name: 'regle:devtools-host',
  setup() {
    if (!import.meta.dev) {
      return;
    }

    const regleDevtoolsRpcServer = createBirpcGroup(
      createRegleDevtoolsRpcFunctions(),
      [createRegleDevtoolsHostChannel()],
      {
        timeout: -1,
      }
    );

    setupRegleDevtoolsChangeBroadcast(regleDevtoolsRpcServer.broadcast);
  },
});
