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
      {
        text: 'Built-in rules',
        link: '/core-concepts/rules/built-in-rules',
      },
    ],
  },
  { text: 'Validation properties', link: '/core-concepts/validation-properties' },
  { text: 'Rules properties', link: '/core-concepts/rules-properties' },
  { text: 'Displaying errors', link: '/core-concepts/displaying-errors' },
  { text: 'Modifiers', link: '/core-concepts/modifiers' },
  { text: 'Global configuration', link: '/core-concepts/global-config' },
];

const AdvancedUsage: (DefaultTheme.NavItemWithLink | DefaultTheme.NavItemChildren)[] = [
  {
    text: 'Collections',
    items: [
      { text: 'Declaring rules', link: '/advanced-usage/collections/collections-rules' },
      { text: 'Displaying errors', link: '/advanced-usage/collections/collections-rules' },
    ],
  },
  { text: 'Usage with Pinia', link: '/advanced-usage/pinia' },
  { text: 'Using metadata from rules', link: '/' },
  { text: 'Rules operators', link: '/advanced-usage/operators' },
  { text: 'Validation helpers', link: '/advanced-usage/helpers' },
  { text: 'Usage with Zod', link: '/zod/' },
];

const Rules: DefaultTheme.NavItemWithLink[] = [{ text: 'required', link: '/rules/required' }];

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
        text: 'Advanced Usage',
        items: AdvancedUsage,
      },
      {
        text: 'Built-in rules',
        items: Rules,
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
