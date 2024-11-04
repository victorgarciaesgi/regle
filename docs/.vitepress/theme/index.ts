import { h } from 'vue';
import type { Theme } from 'vitepress';
import DefaultTheme from 'vitepress/theme';
import './style.css';
import './custom.css';
import '@shikijs/vitepress-twoslash/style.css';
import TwoslashFloatingVue from '@shikijs/vitepress-twoslash/client';
import type { EnhanceAppContext } from 'vitepress';

export default {
  extends: DefaultTheme,
  Layout: () => {
    return h(DefaultTheme.Layout, null, {});
  },
  enhanceApp({ app }: EnhanceAppContext) {
    app.use(TwoslashFloatingVue as any);
  },
} satisfies Theme;
