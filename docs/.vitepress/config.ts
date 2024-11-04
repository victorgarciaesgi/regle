import { DefaultTheme, defineConfig } from 'vitepress';
import { transformerTwoslash } from '@shikijs/vitepress-twoslash';

const GUIDES: DefaultTheme.NavItemWithLink[] = [
  { text: 'Getting Started', link: '/guide/' },
  { text: 'Installation & Usage', link: '/guide/install' },
];

export default defineConfig({
  title: 'Regle',
  description: 'A reactive and declarative vue form library',
  head: [['link', { rel: 'icon', href: '/favicon.ico' }]],
  themeConfig: {
    logo: '../../assets/logo.png',
    nav: GUIDES,
    search: {
      provider: 'local',
    },
    sidebar: [
      {
        text: 'Guide',
        items: GUIDES,
      },
    ],
    socialLinks: [{ icon: 'github', link: 'https://github.com/victorgarciaesgi/regle' }],
  },
  markdown: {
    codeTransformers: [transformerTwoslash()],
  },
});
