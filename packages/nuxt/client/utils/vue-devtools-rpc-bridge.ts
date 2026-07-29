import { onRpcConnected } from '@vue/devtools-core';
import { createRpcClient } from '@vue/devtools-kit';
import { createHooks } from 'hookable';
import { createRegleDevtoolsClientChannel } from './regle-devtools-channel';

const clientHooks = createHooks();

export function setupRegleVueDevtoolsRpcBridge() {
  createRpcClient(
    {
      on: (event: string, handler: (...args: unknown[]) => void) => {
        clientHooks.hook(event, handler);
      },
      off: (event: string, handler: (...args: unknown[]) => void) => {
        clientHooks.removeHook(event, handler);
      },
      once: (event: string, handler: (...args: unknown[]) => void) => {
        clientHooks.hookOnce(event, handler);
      },
      emit: (event: string, ...args: unknown[]) => {
        clientHooks.callHook(event, ...args);
      },
      heartbeat: () => true,
    },
    {
      channel: createRegleDevtoolsClientChannel(),
    }
  );

  return new Promise<void>((resolve) => {
    onRpcConnected(() => {
      resolve();
    });
  });
}
