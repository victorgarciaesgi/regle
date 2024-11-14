import type { DefaultTheme } from 'vitepress';
import { defineConfig } from 'vitepress';
import { transformerTwoslash } from '@shikijs/vitepress-twoslash';

const Nav: DefaultTheme.NavItemWithLink[] = [
  { text: 'Getting Started', link: '/introduction/' },
  { text: 'Core concepts', link: '/core-concepts/' },
];

const CoreConcepts: (DefaultTheme.NavItemWithLink | DefaultTheme.NavItemChildren)[] = [
  { text: 'useRegle', link: '/core-concepts/' },
  {
    text: 'Rules',
    items: [
      { text: 'Inline rules', link: '/core-concepts/rules/' },
      {
        text: 'Advanced rules',
        link: '/core-concepts/rules/advanced-rules',
      },
    ],
  },
  { text: 'Validation properties', link: '/core-concepts/validation-properties' },
  { text: 'Rules properties', link: '/core-concepts/rules-properties' },
  { text: 'Modifiers', link: '/core-concepts/modifiers' },
];

export default defineConfig({
  title: 'Regle',
  description: 'A reactive and declarative vue form library',
  themeConfig: {
    logo: {
      dark: '/logo-reversed.png',
      light: '/logo.png',
    },
    nav: Nav,
    search: {
      provider: 'local',
    },
    sidebar: [
      {
        text: 'Introduction',
        items: [{ text: 'Getting Started', link: '/introduction/' }],
      },
      {
        text: 'Core concepts',
        items: CoreConcepts,
      },
      {
        text: 'Zod',
        items: [{ text: 'Usage with Zod', link: '/zod/' }],
      },
    ],
    socialLinks: [{ icon: 'github', link: 'https://github.com/victorgarciaesgi/regle' }],
  },
  markdown: {
    codeTransformers: [transformerTwoslash({})],
    theme: 'vitesse-dark',
  },
  srcDir: './src',
});
