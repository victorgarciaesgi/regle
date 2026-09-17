import { createScopedUseRegle, RegleVuePlugin } from '@regle/core';
import { required } from '@regle/rules';
import { createSSRApp, defineComponent, h, ref, type App } from 'vue';
import { renderToString } from 'vue/server-renderer';

const { useScopedRegle, useCollectScope } = createScopedUseRegle();

const ScopedChild = defineComponent({
  setup() {
    const { r$ } = useScopedRegle({ email: '' }, { email: { required } });
    return () => h('input', { value: r$.$value.email });
  },
});

async function renderRequestAsSsrRequest(): Promise<void> {
  const app = createSSRApp({ render: () => h('div', [h(ScopedChild)]) });
  app.use(RegleVuePlugin);
  await renderToString(app);
}

async function collectedCount(): Promise<number> {
  let count = -1;
  const app = createSSRApp(
    defineComponent({
      setup() {
        const { r$ } = useCollectScope();
        return () => {
          count = r$.$instances?.length ?? 0;
          return h('div');
        };
      },
    })
  );
  app.use(RegleVuePlugin);
  await renderToString(app);
  return count;
}

describe('useScopedRegle - SSR isolation', () => {
  it('should not leak instances from finished renders into a later app', async () => {
    // given
    expect(await collectedCount()).toBe(0);

    // when
    for (let i = 0; i < 20; i++) {
      await renderRequestAsSsrRequest();
    }

    // then
    expect(await collectedCount()).toBe(0);
  });

  it('should not let one app observe instances registered by another app', async () => {
    // given
    let appAInstances = -1;
    let appBInstances = -1;

    const Collector = (record: (n: number) => void) =>
      defineComponent({
        setup() {
          const { r$ } = useCollectScope();
          return () => {
            record(r$.$instances?.length ?? 0);
            return h('div');
          };
        },
      });

    // when
    const appA = createSSRApp({
      render: () => h('div', [h(ScopedChild), h(ScopedChild), h(Collector((n) => (appAInstances = n)))]),
    });
    appA.use(RegleVuePlugin);
    await renderToString(appA);

    const appB = createSSRApp({ render: () => h('div', [h(ScopedChild), h(Collector((n) => (appBInstances = n)))]) });
    appB.use(RegleVuePlugin);
    await renderToString(appB);

    // then
    expect(appAInstances).toBe(2);
    expect(appBInstances).toBe(1);
  });

  it('should keep registrations made outside of any app in their own scope', async () => {
    // given
    const { r$: outsideR$, dispose } = useScopedRegle({ email: '' }, { email: { required } });
    let collectedInApp = -1;

    const Collector = defineComponent({
      setup() {
        const { r$ } = useCollectScope();
        return () => {
          collectedInApp = r$.$instances?.length ?? 0;
          return h('div');
        };
      },
    });

    // when
    const app = createSSRApp({ render: () => h('div', [h(ScopedChild), h(Collector)]) });
    app.use(RegleVuePlugin);
    await renderToString(app);

    // then
    expect(outsideR$).toBeDefined();
    expect(collectedInApp).toBe(1);

    dispose();
  });

  it('should still honour an explicit customStore', async () => {
    // given
    const customStore = ref({});
    const { useScopedRegle: useStoredRegle } = createScopedUseRegle({ customStore });

    const StoredChild = defineComponent({
      setup() {
        const { r$ } = useStoredRegle({ email: '' }, { email: { required } });
        return () => h('input', { value: r$.$value.email });
      },
    });

    // when
    const app: App = createSSRApp({ render: () => h('div', [h(StoredChild)]) });
    app.use(RegleVuePlugin);
    await renderToString(app);

    // then
    expect(Object.keys(customStore.value['~~global'] ?? {})).toHaveLength(1);
  });
});
