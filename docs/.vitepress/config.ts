import { transformerTwoslash } from '@shikijs/vitepress-twoslash';
import type { DefaultTheme, HeadConfig, PageData } from 'vitepress';
import { defineConfig } from 'vitepress';
import { groupIconMdPlugin, groupIconVitePlugin, localIconLoader } from 'vitepress-plugin-group-icons';
import vueJsx from '@vitejs/plugin-vue-jsx';
import { generateSatoriBanner } from './satori-banner';
import { version } from '../../package.json';
import llmstxt from 'vitepress-plugin-llms';

const CoreConcepts: (DefaultTheme.NavItemWithLink | DefaultTheme.NavItemChildren)[] = [
  { text: 'useRegle', link: '/core-concepts/' },
  {
    text: 'Rules',
    items: [
      { text: 'Writing a rule', link: '/core-concepts/rules/' },
      {
        text: 'Reusable rules',
        link: '/core-concepts/rules/reusable-rules',
      },
      {
        text: 'Built-in rules',
        link: '/core-concepts/rules/built-in-rules',
      },
      {
        text: 'Properties',
        link: '/core-concepts/rules/rules-properties',
      },
      {
        text: 'Wrappers',
        link: '/core-concepts/rules/rule-wrappers',
      },
      { text: 'Operators', link: '/core-concepts/rules/rules-operators' },
      { text: 'Helpers', link: '/core-concepts/rules/validations-helpers' },
    ],
  },
  { text: 'Validation properties', link: '/core-concepts/validation-properties' },
  { text: 'Displaying errors', link: '/core-concepts/displaying-errors' },
  { text: 'Modifiers', link: '/core-concepts/modifiers' },
];

const Nav: (DefaultTheme.NavItem | DefaultTheme.NavItemChildren)[] = [
  { text: 'Getting Started', link: '/introduction/' },
  { text: 'Core concepts', items: CoreConcepts },
  {
    text: 'Resources',
    items: [
      { items: [{ text: 'Playground', link: 'https://play.reglejs.dev' }] },
      { items: [{ text: 'Cheat Sheet', link: '/cheat-sheet' }] },
      {
        items: [
          {
            text: 'Blog',
            link: '/blog',
          },
        ],
      },
    ],
  },
  {
    text: `v${version}`,
    items: [
      {
        items: [
          {
            text: `v${version}`,
            link: `https://github.com/victorgarciaesgi/regle/releases/tag/v${version}`,
          },
          {
            text: 'Releases Notes',
            link: `https://github.com/victorgarciaesgi/regle/releases`,
          },
        ],
      },
    ],
  },
];

const AdvancedUsage: (DefaultTheme.NavItemWithLink | DefaultTheme.NavItemChildren)[] = [
  {
    text: 'Validating arrays',
    link: '/advanced-usage/collections',
  },
  { text: 'Usage with Pinia', link: '/advanced-usage/usage-with-pinia' },
  { text: 'Rules metadata', link: '/advanced-usage/rule-metadata' },
  { text: 'Async validators', link: '/advanced-usage/async-validation' },
  { text: 'Global configuration', link: '/advanced-usage/global-config' },
  { text: 'Variants', link: '/advanced-usage/variants' },
  { text: 'Scoped validation', link: '/advanced-usage/scoped-validation' },
  { text: 'Properties shortcuts', link: '/advanced-usage/extend-properties' },
  { text: 'Merge multiple Regles', link: '/advanced-usage/merge-regles' },
];

const Typescript: (DefaultTheme.NavItemWithLink | DefaultTheme.NavItemChildren)[] = [
  { text: 'Type safe output', link: '/typescript/type-safe-output' },
  {
    text: 'Typing component props',
    link: '/typescript/typing-props',
  },
  {
    text: 'Rules definitions',
    link: '/typescript/typing-rules',
  },
  {
    text: 'Infer state from rules',
    link: '/typescript/infer-state-from-rules',
  },
];

const Integrations: (DefaultTheme.NavItemWithLink | DefaultTheme.NavItemChildren)[] = [
  {
    text: 'Nuxt',
    link: '/integrations/nuxt',
  },
  {
    text: 'Schemas libraries',
    link: '/integrations/schemas-libraries',
  },
];

const Examples: (DefaultTheme.NavItemWithLink | DefaultTheme.NavItemChildren)[] = [
  {
    text: 'Cheat sheet',
    link: '/cheat-sheet',
  },
  {
    text: 'Complete',
    items: [
      { text: 'Simple form example', link: '/examples/simple' },
      { text: 'Advanced form example', link: '/examples/advanced' },
    ],
  },
  {
    text: 'Specific',
    items: [
      { text: 'Custom rules', link: '/examples/custom-rules' },
      { text: 'Conditional rules', link: '/examples/conditional-rules' },
      { text: 'Collections', link: '/examples/collections' },
      { text: 'Server validation', link: '/examples/server-validation' },
      { text: 'Required indicators', link: '/examples/required-indicators' },
    ],
  },
];

const Troubleshooting: DefaultTheme.NavItemWithLink[] = [
  { text: 'Reactivity caveats', link: '/troubleshooting/reactivity' },
];

const shortDescription = 'Headless model-based form validation library for Vue.js';
const longDescription =
  'Regle is a Headless form validation library made for Vue.js. Regle is about bringing type safety and great DX to forms.';

const keywords =
  'vue forms, vue form library, vue validation library, vue forms typescript, vue model validation, vue zod, vue typescript forms, regle, reglejs, regle vue, regle vue forms, regle vue form';

export default defineConfig({
  title: 'Regle',
  description: shortDescription,
  sitemap: {
    hostname: 'https://reglejs.dev',
  },
  lastUpdated: true,
  cleanUrls: true,
  themeConfig: {
    logo: {
      dark: '/logo-reversed.png',
      light: '/logo.png',
      alt: 'Regle logo',
    },
    nav: Nav,
    search: {
      provider: 'algolia',
      options: {
        indexName: 'regle',
        appId: '1ELQQKBPXN',
        apiKey: '5f6ac82c6d47d8a3d7fdd93dcf430d05',
      },
    },
    editLink: {
      pattern: 'https://github.com/victorgarciaesgi/regle/edit/main/docs/src/:path',
    },
    outline: 'deep',
    sidebar: [
      {
        text: 'Getting Started',
        items: [
          { text: 'Introduction', link: '/introduction/' },
          { text: 'Installation', link: '/introduction/installation' },
          { text: 'Comparisons', link: '/introduction/comparisons' },
          { text: 'Migrate from Vuelidate', link: '/introduction/migrate-from-vuelidate' },
        ],
        collapsed: false,
      },
      {
        text: 'Core concepts',
        items: CoreConcepts,
        collapsed: false,
      },
      {
        text: 'Advanced Usage',
        items: AdvancedUsage,
        collapsed: false,
      },
      {
        text: 'Typescript',
        items: Typescript,
        collapsed: true,
      },
      {
        text: 'Integrations',
        items: Integrations,
        collapsed: true,
      },
      {
        text: 'Examples',
        items: Examples,
        collapsed: true,
      },
      {
        text: 'Troubleshooting',
        items: Troubleshooting,
        collapsed: true,
      },
    ],
    socialLinks: [
      { icon: 'x', link: 'https://x.com/reglejs' },
      { icon: 'bluesky', link: 'https://bsky.app/profile/vicflix.dev' },
      { icon: 'github', link: 'https://github.com/victorgarciaesgi/regle' },
    ],
    footer: {
      message: 'Released under the MIT License. Logo by Johannes Lacourly',
      copyright: 'Copyright © 2023-present Victor Garcia',
    },
  },
  transformHead: async ({ pageData, siteConfig, assets }) => {
    const head: HeadConfig[] = [];

    const relativePath = pageData.relativePath.replace(/index\.md$/, '').replace(/\.md$/, '');

    const pageTitle = pageData.frontmatter?.title ?? siteConfig.site?.title;
    const pageDescription = pageData.frontmatter?.description ?? siteConfig.site?.description;
    const definedOgImage = pageData.frontmatter.ogImage as string | undefined;

    head.push(['meta', { property: 'og:title', content: pageTitle }]);

    if (relativePath !== '') {
      let ogImageUrl: string;

      if (definedOgImage) {
        ogImageUrl = `https://reglejs.dev${definedOgImage}`;
      } else {
        const satoriImagePath = await generateSatoriBanner({
          name: relativePath,
          title: pageTitle,
          description: pageDescription,
          bread: [],
        });

        assets.push(`/${satoriImagePath}`);

        head.push(['meta', { property: 'description', content: pageDescription }]);
        head.push(['meta', { property: 'og:description', content: pageDescription }]);

        ogImageUrl = `https://reglejs.dev/${satoriImagePath}`;
      }

      head.push([
        'meta',
        {
          property: 'og:image',
          content: ogImageUrl,
        },
      ]);
      head.push(['meta', { name: 'twitter:image', content: ogImageUrl }]);
    } else {
      head.push(['meta', { property: 'description', content: longDescription }]);
      head.push(['meta', { property: 'og:description', content: longDescription }]);

      head.push([
        'meta',
        {
          property: 'og:image',
          content: 'https://reglejs.dev/regle-banner-og.png',
        },
      ]);
      head.push(['meta', { name: 'twitter:image', content: 'https://reglejs.dev/regle-banner-og.png' }]);
    }

    return head;
  },
  transformPageData(pageData) {
    const relativePath = pageData.relativePath.replace(/index\.md$/, '').replace(/\.md$/, '');

    let canonicalUrl: string;
    if (relativePath === '') {
      canonicalUrl = `https://reglejs.dev`;
    } else {
      canonicalUrl = `https://reglejs.dev/${relativePath}`;
    }

    pageData.frontmatter.head ??= [];
    pageData.frontmatter.head.push(['link', { rel: 'canonical', href: canonicalUrl }]);
    pageData.frontmatter.head.push(['meta', { rel: 'og:url', href: canonicalUrl }]);

    function getJSONLD(pageData: PageData) {
      if (pageData.relativePath === 'index.md') {
        return `
        {
          "@context":"http://schema.org",
          "@type":"WebSite",
          "url":"https://reglejs.dev/",
          "inLanguage":"en",
          "description":"Headless form validation library for Vue.js",
          "name":"Regle",
          "keywords":"${keywords}"
        }`;
      } else {
        return `
        {
            "@context":"http://schema.org",
            "@type":"TechArticle",
            "headline":"${pageData.title}",
            "inLanguage":"en",
            "mainEntityOfPage":{
              "@type":"WebPage",
              "@id":"${canonicalUrl}"
            },
            "keywords":"${keywords}",
            "url":"https://reglejs.dev/",
            "name": "Regle"
        }`;
      }
    }

    pageData.frontmatter.head.push(['script', { type: 'application/ld+json' }, getJSONLD(pageData)]);
  },
  head: [
    ['link', { rel: 'icon', href: '/favicon.ico', sizes: '48x48' }],
    ['link', { rel: 'icon', href: '/favicon.svg', sizes: 'any', type: 'image/svg+xml' }],
    ['link', { rel: 'mask-icon', href: '/logo-reglejs-favicon.svg', color: '#ffffff' }],
    ['link', { rel: 'apple-touch-icon', href: '/apple-touch-icon.png', sizes: '180x180' }],
    ['meta', { name: 'viewport', content: 'width=device-width, initial-scale=1, maximum-scale=1' }],
    ['meta', { name: 'author', content: 'Victor Garcia' }],
    ['meta', { name: 'theme-color', content: '#00bb7f' }],
    [
      'meta',
      {
        name: 'keywords',
        content: keywords,
      },
    ],
    ['meta', { property: 'og:type', content: 'website' }],
    ['meta', { property: 'og:site_name', content: 'Regle' }],
    ['meta', { property: 'og:logo', content: 'https://reglejs.dev/logo_main.png' }],
    [
      'meta',
      {
        property: 'description',
        content: longDescription,
      },
    ],
    ['meta', { name: 'twitter:site', content: '@regle' }],
    ['meta', { name: 'twitter:domain', content: 'reglejs.dev' }],
    ['meta', { name: 'twitter:description', content: 'Regle is a Headless form validation library made for Vue.js' }],
    ['meta', { name: 'twitter:url', content: 'https://reglejs.dev' }],
    ['meta', { name: 'twitter:title', content: 'Regle' }],
    ['meta', { name: 'twitter:card', content: 'summary_large_image' }],
    [
      'script',
      { defer: '', src: 'https://cloud.umami.is/script.js', 'data-website-id': 'b891ca9d-441a-44e0-ba1b-a35bea61fb35' },
    ],
  ],
  markdown: {
    codeTransformers: [transformerTwoslash({}) as any],
    theme: {
      dark: 'vitesse-dark',
      light: 'everforest-light',
    },
    config(md) {
      md.use(groupIconMdPlugin);
    },
  },
  vite: {
    plugins: [
      vueJsx(),
      llmstxt(),
      groupIconVitePlugin({
        customIcon: {
          pinia: localIconLoader(import.meta.url, '../src/assets/pinia-logo.svg'),
          zod: localIconLoader(import.meta.url, '../src/assets/zod4-logo.svg'),
          valibot: localIconLoader(import.meta.url, '../src/assets/valibot-logo.svg'),
          arktype: localIconLoader(import.meta.url, '../src/assets/arktype-logo.svg'),
          malt: localIconLoader(import.meta.url, '../src/assets/malt-logo.svg'),
        },
      }) as any,
    ],
  },
  srcDir: './src',
});
