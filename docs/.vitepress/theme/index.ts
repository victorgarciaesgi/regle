import { h, nextTick, onMounted, watch } from 'vue';
import { useRoute, type Theme } from 'vitepress';
import DefaultTheme from 'vitepress/theme';
import './style.css';
import './custom.scss';
import '@shikijs/vitepress-twoslash/style.css';
import TwoslashFloatingVue from '@shikijs/vitepress-twoslash/client';
import type { EnhanceAppContext } from 'vitepress';
import 'virtual:group-icons.css';
import { createPinia } from 'pinia';

export default {
  extends: DefaultTheme,
  Layout: () => {
    return h(DefaultTheme.Layout, null, {});
  },
  enhanceApp({ app, router }: EnhanceAppContext) {
    app.use(TwoslashFloatingVue as any);
    const pinia = createPinia();
    app.use(pinia);

    onMounted(async () => {
      await nextTick();
      scrollToActiveSidebarItem();
    });

    watch(
      () => router.route.path,
      () =>
        nextTick(() => {
          scrollToActiveSidebarItem();
        }),
      {
        immediate: true,
      }
    );
  },
} satisfies Theme;

function scrollToActiveSidebarItem() {
  setTimeout(() => {
    const activeLink = document.querySelector('#VPSidebarNav div.is-link.is-active.has-active');
    if (activeLink) {
      activeLink.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, 1000);
}
