import { h, nextTick, watch } from 'vue';
import { type Theme } from 'vitepress';
import '@shikijs/vitepress-twoslash/style.css';
import TwoslashFloatingVue from '@shikijs/vitepress-twoslash/client';
import type { EnhanceAppContext } from 'vitepress';
import 'virtual:group-icons.css';
import { createPinia } from 'pinia';
import DefaultTheme from 'vitepress/theme';
import { RegleVuePlugin } from '@regle/core';
import './style.css';
import './custom.scss';

export default {
  extends: DefaultTheme,
  Layout: () => {
    return h(DefaultTheme.Layout, null, {});
  },
  enhanceApp({ app, router }: EnhanceAppContext) {
    app.use(TwoslashFloatingVue as any);
    const pinia = createPinia();
    app.use(pinia);
    app.use(RegleVuePlugin);
    app.use({
      async install() {
        await nextTick();
        scrollToActiveSidebarItem();
      },
    });

    watch(
      () => router.route.path,
      () =>
        nextTick(() => {
          scrollToActiveSidebarItem();
        })
    );
  },
} satisfies Theme;

function scrollToActiveSidebarItem() {
  if (typeof window !== 'undefined') {
    setTimeout(() => {
      const activeLink = document.querySelector('#VPSidebarNav div.is-link.is-active.has-active');
      if (activeLink) {
        activeLink.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 400);
  }
}
