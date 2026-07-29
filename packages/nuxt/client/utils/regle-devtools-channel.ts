import SuperJSON from 'superjson';

export const REGLE_DEVTOOLS_RPC_EVENT = '__REGLE_DEVTOOLS_RPC__';

function getRegleDevtoolsHostWindow(): Window {
  return window.top ?? window.parent;
}

export function createRegleDevtoolsClientChannel() {
  return {
    post: (data: unknown) => {
      getRegleDevtoolsHostWindow().postMessage(
        SuperJSON.stringify({
          event: REGLE_DEVTOOLS_RPC_EVENT,
          data,
        }),
        '*'
      );
    },
    on: (handler: (data: unknown) => void) => {
      const listener = (event: MessageEvent) => {
        try {
          const parsed = SuperJSON.parse<{ event: string; data: unknown }>(event.data);
          if (event.source === getRegleDevtoolsHostWindow() && parsed.event === REGLE_DEVTOOLS_RPC_EVENT) {
            handler(parsed.data);
          }
        } catch {
          // ignore unrelated messages
        }
      };

      window.addEventListener('message', listener);

      return () => {
        window.removeEventListener('message', listener);
      };
    },
  };
}
