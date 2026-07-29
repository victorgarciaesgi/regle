import SuperJSON from 'superjson';

export const REGLE_DEVTOOLS_RPC_EVENT = '__REGLE_DEVTOOLS_RPC__';
const REGLE_DEVTOOLS_UI_ROUTE_FRAGMENT = '__regle';

export function createRegleDevtoolsHostChannel() {
  let regleClientWindow: Window | null = null;

  function rememberRegleClientWindow(event: MessageEvent) {
    if (event.source && event.source !== window) {
      regleClientWindow = event.source as Window;
    }
  }

  function findRegleDevtoolsWindow(root: Document | ShadowRoot = document): Window | null {
    for (const iframe of root.querySelectorAll('iframe')) {
      if (iframe.src.includes(REGLE_DEVTOOLS_UI_ROUTE_FRAGMENT)) {
        return iframe.contentWindow;
      }

      try {
        const nestedDocument = iframe.contentDocument;
        if (nestedDocument) {
          const nestedWindow = findRegleDevtoolsWindow(nestedDocument);
          if (nestedWindow) {
            return nestedWindow;
          }
        }
      } catch {
        // ignore cross-origin frames
      }
    }

    for (const element of root.querySelectorAll('*')) {
      if (element.shadowRoot) {
        const nestedWindow = findRegleDevtoolsWindow(element.shadowRoot);
        if (nestedWindow) {
          return nestedWindow;
        }
      }
    }

    return null;
  }

  return {
    post: (data: unknown) => {
      const targetWindow = findRegleDevtoolsWindow() ?? regleClientWindow;
      targetWindow?.postMessage(
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
          if (parsed.event !== REGLE_DEVTOOLS_RPC_EVENT) {
            return;
          }

          rememberRegleClientWindow(event);
          handler(parsed.data);
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
