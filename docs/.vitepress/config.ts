import { transformerTwoslash } from '@shikijs/vitepress-twoslash';
import type { DefaultTheme, HeadConfig, PageData } from 'vitepress';
import { defineConfig } from 'vitepress';
import { groupIconMdPlugin, groupIconVitePlugin, localIconLoader } from 'vitepress-plugin-group-icons';
import vueJsx from '@vitejs/plugin-vue-jsx';
import { generateSatoriBanner } from './satori-banner';
import { version } from '../../package.json';

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
  { text: 'Type safe output', link: '/core-concepts/type-safe-output' },
  { text: 'Modifiers', link: '/core-concepts/modifiers' },
];

const Nav: (DefaultTheme.NavItem | DefaultTheme.NavItemChildren)[] = [
  { text: 'Getting Started', link: '/introduction/' },
  { text: 'Core concepts', items: CoreConcepts },
  {
    text: 'Resources',
    items: [
      { items: [{ text: 'Playground', link: 'https://play.reglejs.dev' }] },
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
    text: 'Collections',
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
  {
    text: 'Typing props',
    link: '/typescript/typing-props',
  },
  {
    text: 'Typing rules',
    link: '/typescript/typing-rules',
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
        text: 'Introduction',
        items: [
          { text: 'Getting Started', link: '/introduction/' },
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
        text: 'Typescript',
        items: Typescript,
        collapsed: false,
      },
      {
        text: 'Advanced Usage',
        items: AdvancedUsage,
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
      { icon: 'x', link: 'https://x.com/desnoth_dev' },
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

    head.push(['meta', { property: 'og:title', content: pageTitle }]);

    if (relativePath !== '') {
      const satoriImagePath = await generateSatoriBanner({
        name: relativePath,
        title: pageTitle,
        description: pageDescription,
        bread: [],
      });

      assets.push(`/${satoriImagePath}`);

      head.push(['meta', { property: 'description', content: pageDescription }]);
      head.push(['meta', { property: 'og:description', content: pageDescription }]);

      const ogImageUrl = `https://reglejs.dev/${satoriImagePath}`;
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
        return `{
          "@context":"http://schema.org",
          "@type":"WebSite",
          "url":"https:\/\/reglejs.dev\/",
          "inLanguage":"en",
          "description":"Headless model-based form validation library for Vue.js",
          "name":"${pageData.title}"
        }`;
      } else {
        return `{
            "@context":"http://schema.org",
            "@type":"TechArticle",
            "headline":"${pageData.title}",
            "inLanguage":"en",
            "mainEntityOfPage":{
              "@type":"WebPage",
              "@id":"${canonicalUrl}"
            },
            "keywords":"regle, vue, forms, typescript",
            "url":"${canonicalUrl}"
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
        content:
          'vue forms, vue form library, vue validation library, vue forms typescript, vue model validation, vue zod, vue typescript forms, regle, reglejs, regle vue, regle vue forms, regle vue form',
      },
    ],
    ['meta', { property: 'og:type', content: 'website' }],
    ['meta', { property: 'og:site_name', content: 'Regle' }],
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
      groupIconVitePlugin({
        customIcon: {
          pinia:
            '<svg width="14px" height="14px" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 319 477"><linearGradient id="a"><stop offset="0" stop-color="#52ce63"/><stop offset="1" stop-color="#51a256"/></linearGradient><linearGradient id="b" x1="55.342075%" x2="42.816933%" xlink:href="#a" y1="0%" y2="42.862855%"/><linearGradient id="c" x1="55.348642%" x2="42.808103%" xlink:href="#a" y1="0%" y2="42.862855%"/><linearGradient id="d" x1="50%" x2="50%" y1="0%" y2="58.811243%"><stop offset="0" stop-color="#8ae99c"/><stop offset="1" stop-color="#52ce63"/></linearGradient><linearGradient id="e" x1="51.37763%" x2="44.584719%" y1="17.472551%" y2="100%"><stop offset="0" stop-color="#ffe56c"/><stop offset="1" stop-color="#ffc63a"/></linearGradient><g fill="none" fill-rule="evenodd" transform="translate(-34 -24)"><g transform="matrix(.99254615 .12186934 -.12186934 .99254615 33.922073 .976691)"><path d="m103.950535 258.274149c44.361599-4.360825 60.014503-40.391282 65.353094-94.699444s-30.93219-103.451001-46.020347-101.9678079c-15.088156 1.4831932-63.0385313 58.9051239-68.3771222 113.2132869-5.3385908 54.308162 4.6827754 87.814791 49.0443752 83.453965z" fill="url(#b)" transform="matrix(.70710678 -.70710678 .70710678 .70710678 -80.496332 125.892944)"/><path d="m275.876752 258.273992c44.3616 4.360826 53.167133-29.265322 47.828542-83.573485-5.338591-54.308162-52.073133-111.6105744-67.16129-113.0937675-15.088156-1.4831931-52.57477 47.5401275-47.236179 101.8482895s22.207328 90.458137 66.568927 94.818963z" fill="url(#c)" transform="matrix(.70710678 .70710678 -.70710678 .70710678 191.403399 -141.861963)"/><path d="m188.370027 216.876305c39.941834 0 50.95265-38.251987 50.95265-97.89874 0-59.6467532-37.367733-118.10125956-50.95265-118.10125956s-52.04735 58.45450636-52.04735 118.10125956c0 59.646753 12.105516 97.89874 52.04735 97.89874z" fill="url(#d)"/></g><path d="m184.473473 501c83.118854 0 150.526527-24.145148 150.526527-133.645148s-67.407673-199.354852-150.526527-199.354852c-83.118855 0-150.473473 89.854852-150.473473 199.354852s67.354618 133.645148 150.473473 133.645148z" fill="url(#e)"/><ellipse cx="260.5" cy="335" fill="#eaadcc" rx="21.5" ry="10"/><ellipse cx="102.5" cy="329" fill="#eaadcc" rx="21.5" ry="10" transform="matrix(.99254615 .12186934 -.12186934 .99254615 40.859033 -10.039292)"/><g transform="matrix(-.99939083 .0348995 .0348995 .99939083 269.284825 271.027667)"><path d="m73.1046985 58.2728794c6.7372416 4.9130333 14.3132632 6.6640587 22.7280649 5.2530761 8.4148016-1.4109825 14.5054466-5.2535769 18.2719346-11.527783" stroke="#000" stroke-linecap="round" stroke-linejoin="round" stroke-width="6" transform="matrix(.9998477 .01745241 -.01745241 .9998477 1.026464 -1.624794)"/><path d="m154.501124 3c-5.937545 0-11.312782 2.40629805-15.203644 6.29680621-3.89094 3.89058529-6.29748 9.26545449-6.29748 15.20263179 0 5.9376888 2.406488 11.3127422 6.297291 15.2034272 3.890886 3.8907673 9.266197 6.2971348 15.203833 6.2971348 5.937109 0 11.311896-2.4063889 15.202387-6.2972348 3.890299-3.8906535 6.296489-9.2656636 6.296489-15.2033272 0-5.9371521-2.406242-11.3119781-6.296677-15.20253181-3.890469-3.89058674-9.265181-6.29690619-15.202199-6.29690619z" fill="#000"/><path d="m154 21c0-3.865549 3.135362-7 6.999413-7 3.866399 0 7.000587 3.134451 7.000587 7s-3.134188 7-7.000587 7c-3.864051-.0011735-6.999413-3.134451-6.999413-7z" fill="#fff"/><path d="m24.5 13c-5.9375292 0-11.312426 2.406268-15.20299427 6.2967181-3.89069464 3.8905765-6.29700573 9.2654765-6.29700573 15.2027199 0 5.9377549 2.40625962 11.3128391 6.29681766 15.2035153 3.89059104 3.8907092 9.26556184 6.2970467 15.20318234 6.2970467 5.9371249 0 11.3122514-2.406419 15.2030371-6.2973229 3.8905441-3.8906623 6.2969629-9.2656416 6.2969629-15.2032391 0-5.937086-2.4064703-11.3118811-6.297151-15.2024437-3.890763-3.8906448-9.2658154-6.2969943-15.202849-6.2969943z" fill="#000"/><g fill="#fff"><path d="m136 24.499438c0 10.2185232 8.282911 18.500562 18.501124 18.500562 10.217089 0 18.498876-8.2820388 18.498876-18.500562 0-10.2173992-8.281787-18.499438-18.498876-18.499438-10.218213 0-18.501124 8.2820388-18.501124 18.499438zm-6 0c0-13.5311954 10.96929-24.499438 24.501124-24.499438 13.530838 0 24.498876 10.9683711 24.498876 24.499438 0 13.5319607-10.967808 24.500562-24.498876 24.500562-13.532064 0-24.501124-10.9684728-24.501124-24.500562z" fill-rule="nonzero" stroke="#fff" stroke-width="3"/><path d="m6 34.499438c0 10.2185232 8.2817873 18.500562 18.5 18.500562 10.2170889 0 18.5-8.2820388 18.5-18.500562 0-10.2173992-8.2829111-18.499438-18.5-18.499438-10.2182127 0-18.5 8.2820388-18.5 18.499438zm-6 0c0-13.531297 10.9682681-24.499438 24.5-24.499438 13.5309398 0 24.5 10.9684728 24.5 24.499438 0 13.5318591-10.96883 24.500562-24.5 24.500562-13.531962 0-24.5-10.9683711-24.5-24.500562z" fill-rule="nonzero" stroke="#fff" stroke-width="3"/><path d="m24 31c0-3.865549 3.134451-7 7-7s7 3.134451 7 7-3.134451 7-7 7-7-3.134451-7-7z"/></g></g><g stroke-linecap="round" stroke-width="11"><g stroke="#ecb732"><path d="m70.5 377.5 74 77"/><path d="m134.5 386.5-47 50"/></g><g stroke="#ecb732" transform="matrix(-1 0 0 1 298 377)"><path d="m.5.5 74 77"/><path d="m64.5 9.5-47 50"/></g><g stroke="#ffc73b" transform="matrix(0 1 -1 0 215 207)"><path d="m.5.5 49 49"/><path d="m.5 10.5 49 49" transform="matrix(-1 0 0 1 50 0)"/></g></g></g></svg>',
          '.store.ts':
            '<svg width="14px" height="14px" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 319 477"><linearGradient id="a"><stop offset="0" stop-color="#52ce63"/><stop offset="1" stop-color="#51a256"/></linearGradient><linearGradient id="b" x1="55.342075%" x2="42.816933%" xlink:href="#a" y1="0%" y2="42.862855%"/><linearGradient id="c" x1="55.348642%" x2="42.808103%" xlink:href="#a" y1="0%" y2="42.862855%"/><linearGradient id="d" x1="50%" x2="50%" y1="0%" y2="58.811243%"><stop offset="0" stop-color="#8ae99c"/><stop offset="1" stop-color="#52ce63"/></linearGradient><linearGradient id="e" x1="51.37763%" x2="44.584719%" y1="17.472551%" y2="100%"><stop offset="0" stop-color="#ffe56c"/><stop offset="1" stop-color="#ffc63a"/></linearGradient><g fill="none" fill-rule="evenodd" transform="translate(-34 -24)"><g transform="matrix(.99254615 .12186934 -.12186934 .99254615 33.922073 .976691)"><path d="m103.950535 258.274149c44.361599-4.360825 60.014503-40.391282 65.353094-94.699444s-30.93219-103.451001-46.020347-101.9678079c-15.088156 1.4831932-63.0385313 58.9051239-68.3771222 113.2132869-5.3385908 54.308162 4.6827754 87.814791 49.0443752 83.453965z" fill="url(#b)" transform="matrix(.70710678 -.70710678 .70710678 .70710678 -80.496332 125.892944)"/><path d="m275.876752 258.273992c44.3616 4.360826 53.167133-29.265322 47.828542-83.573485-5.338591-54.308162-52.073133-111.6105744-67.16129-113.0937675-15.088156-1.4831931-52.57477 47.5401275-47.236179 101.8482895s22.207328 90.458137 66.568927 94.818963z" fill="url(#c)" transform="matrix(.70710678 .70710678 -.70710678 .70710678 191.403399 -141.861963)"/><path d="m188.370027 216.876305c39.941834 0 50.95265-38.251987 50.95265-97.89874 0-59.6467532-37.367733-118.10125956-50.95265-118.10125956s-52.04735 58.45450636-52.04735 118.10125956c0 59.646753 12.105516 97.89874 52.04735 97.89874z" fill="url(#d)"/></g><path d="m184.473473 501c83.118854 0 150.526527-24.145148 150.526527-133.645148s-67.407673-199.354852-150.526527-199.354852c-83.118855 0-150.473473 89.854852-150.473473 199.354852s67.354618 133.645148 150.473473 133.645148z" fill="url(#e)"/><ellipse cx="260.5" cy="335" fill="#eaadcc" rx="21.5" ry="10"/><ellipse cx="102.5" cy="329" fill="#eaadcc" rx="21.5" ry="10" transform="matrix(.99254615 .12186934 -.12186934 .99254615 40.859033 -10.039292)"/><g transform="matrix(-.99939083 .0348995 .0348995 .99939083 269.284825 271.027667)"><path d="m73.1046985 58.2728794c6.7372416 4.9130333 14.3132632 6.6640587 22.7280649 5.2530761 8.4148016-1.4109825 14.5054466-5.2535769 18.2719346-11.527783" stroke="#000" stroke-linecap="round" stroke-linejoin="round" stroke-width="6" transform="matrix(.9998477 .01745241 -.01745241 .9998477 1.026464 -1.624794)"/><path d="m154.501124 3c-5.937545 0-11.312782 2.40629805-15.203644 6.29680621-3.89094 3.89058529-6.29748 9.26545449-6.29748 15.20263179 0 5.9376888 2.406488 11.3127422 6.297291 15.2034272 3.890886 3.8907673 9.266197 6.2971348 15.203833 6.2971348 5.937109 0 11.311896-2.4063889 15.202387-6.2972348 3.890299-3.8906535 6.296489-9.2656636 6.296489-15.2033272 0-5.9371521-2.406242-11.3119781-6.296677-15.20253181-3.890469-3.89058674-9.265181-6.29690619-15.202199-6.29690619z" fill="#000"/><path d="m154 21c0-3.865549 3.135362-7 6.999413-7 3.866399 0 7.000587 3.134451 7.000587 7s-3.134188 7-7.000587 7c-3.864051-.0011735-6.999413-3.134451-6.999413-7z" fill="#fff"/><path d="m24.5 13c-5.9375292 0-11.312426 2.406268-15.20299427 6.2967181-3.89069464 3.8905765-6.29700573 9.2654765-6.29700573 15.2027199 0 5.9377549 2.40625962 11.3128391 6.29681766 15.2035153 3.89059104 3.8907092 9.26556184 6.2970467 15.20318234 6.2970467 5.9371249 0 11.3122514-2.406419 15.2030371-6.2973229 3.8905441-3.8906623 6.2969629-9.2656416 6.2969629-15.2032391 0-5.937086-2.4064703-11.3118811-6.297151-15.2024437-3.890763-3.8906448-9.2658154-6.2969943-15.202849-6.2969943z" fill="#000"/><g fill="#fff"><path d="m136 24.499438c0 10.2185232 8.282911 18.500562 18.501124 18.500562 10.217089 0 18.498876-8.2820388 18.498876-18.500562 0-10.2173992-8.281787-18.499438-18.498876-18.499438-10.218213 0-18.501124 8.2820388-18.501124 18.499438zm-6 0c0-13.5311954 10.96929-24.499438 24.501124-24.499438 13.530838 0 24.498876 10.9683711 24.498876 24.499438 0 13.5319607-10.967808 24.500562-24.498876 24.500562-13.532064 0-24.501124-10.9684728-24.501124-24.500562z" fill-rule="nonzero" stroke="#fff" stroke-width="3"/><path d="m6 34.499438c0 10.2185232 8.2817873 18.500562 18.5 18.500562 10.2170889 0 18.5-8.2820388 18.5-18.500562 0-10.2173992-8.2829111-18.499438-18.5-18.499438-10.2182127 0-18.5 8.2820388-18.5 18.499438zm-6 0c0-13.531297 10.9682681-24.499438 24.5-24.499438 13.5309398 0 24.5 10.9684728 24.5 24.499438 0 13.5318591-10.96883 24.500562-24.5 24.500562-13.531962 0-24.5-10.9683711-24.5-24.500562z" fill-rule="nonzero" stroke="#fff" stroke-width="3"/><path d="m24 31c0-3.865549 3.134451-7 7-7s7 3.134451 7 7-3.134451 7-7 7-7-3.134451-7-7z"/></g></g><g stroke-linecap="round" stroke-width="11"><g stroke="#ecb732"><path d="m70.5 377.5 74 77"/><path d="m134.5 386.5-47 50"/></g><g stroke="#ecb732" transform="matrix(-1 0 0 1 298 377)"><path d="m.5.5 74 77"/><path d="m64.5 9.5-47 50"/></g><g stroke="#ffc73b" transform="matrix(0 1 -1 0 215 207)"><path d="m.5.5 49 49"/><path d="m.5 10.5 49 49" transform="matrix(-1 0 0 1 50 0)"/></g></g></g></svg>',
          zod: localIconLoader(import.meta.url, '../src/assets/zod4-logo.svg'),
          valibot: `<svg viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="a" x1=".41" x2="0" y1=".26" y2=".93"><stop stop-color="#eab308" offset="0"/><stop stop-color="#ca8a04" offset="1"/></linearGradient><linearGradient id="b" x1=".34" x2=".66" y1=".02" y2=".97"><stop stop-color="#fde68a" offset="0"/><stop stop-color="#fbbf24" offset="1"/></linearGradient><linearGradient id="c" y1=".5" y2=".5"><stop stop-color="#7dd3fc" offset="0"/><stop stop-color="#0ea5e9" offset="1"/></linearGradient></defs><path d="M0 0h512v512H0z" fill="none"/><path transform="translate(-592.54 -894.72)" d="M742.27 987.02c-66.7 0-119.12 54.67-121.87 126.41l-2.55 95.47c-3.97 78.65 71.96 105.52 126.94 105.52z" fill="url(#a)"/><path transform="translate(62.42 92.3)" d="M92.62.01h227.27c54.53-.8 95.63 40.1 98.39 93.34l6.14 135.76c.73 67.36-48.12 94.94-104.53 95.33l-227.27 2.93c-58.56.43-93.68-43.7-92.6-98.27l3.8-135.75C7.41 33.53 33.3 1.08 92.62 0" fill="url(#b)"/><path d="M167.82 102.75h213.11c51.13-.75 89.67 37.3 92.25 86.82l5.76 126.3c.69 62.66-45.12 88.32-98.01 88.68l-213.11 2.73c-54.9.4-87.84-40.66-86.82-91.42l3.56-126.29c3.36-55.63 27.64-85.81 83.26-86.82" fill="#111827"/><path transform="translate(365.15 205.36)" d="M27.63 0A27.63 27.63 0 1 1 0 27.63 27.63 27.63 0 0 1 27.63 0" fill="url(#c)"/><path transform="translate(152.03 205.36)" d="M27.63 0A27.63 27.63 0 1 1 0 27.63 27.63 27.63 0 0 1 27.63 0" fill="url(#c)"/></svg>`,
          arktype: `<svg viewBox="0 0 100 100" version="1.1" xmlns="http://www.w3.org/2000/svg"><rect fill="#085b92" width="100" height="100" rx="10"/><g fill="#f5cf8f"><path d="M 53.315857,82.644683 H 39.977324 L 36.75999,93.838326 H 28.582598 L 42.85952,46.918864 h 7.507114 l 14.343949,46.919462 h -8.177392 z m -2.14489,-7.507114 -4.55789,-15.885589 -4.490863,15.885589 z"/><path d="M 73.35719,54.425978 H 62.096519 v -7.507114 h 30.698733 v 7.507114 H 81.534582 V 93.838326 H 73.35719 Z"/></g></svg>`,
        },
      }) as any,
    ],
  },
  srcDir: './src',
});
