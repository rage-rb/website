import {themes as prismThemes} from 'prism-react-renderer';
import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

const config: Config = {
  title: 'Rage.rb',
  tagline: 'Fast, Rails-compatible web framework for Ruby',
  favicon: 'img/logo.svg',

  // https://docusaurus.io/docs/api/docusaurus-config#future
  future: {
    v4: true,
    experimental_faster: true,
  },

  url: 'https://rage-rb.dev',
  baseUrl: '/',

  onBrokenLinks: 'throw',

  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  presets: [
    [
      'classic',
      {
        docs: {
          sidebarPath: './sidebars.ts',
        },
        blog: {
          showReadingTime: true,
          feedOptions: {
            type: ['rss', 'atom'],
            xslt: true,
          },
          onInlineTags: 'warn',
          onInlineAuthors: 'warn',
          onUntruncatedBlogPosts: 'warn',
        },
        theme: {
          customCss: './src/css/custom.css',
        },
      } satisfies Preset.Options,
    ],
  ],

  themeConfig: {
    image: 'img/social.webp',
    colorMode: {
      respectPrefersColorScheme: true,
    },
    metadata: [
      {
        name: "keywords",
        content: "Ruby web framework, Rails alternative, Ruby fibers, Ruby fiber scheduler, Ruby API framework, Ruby microservices, Ruby WebSocket, Ruby REST API",
      }
    ],
    navbar: {
      title: 'Rage.rb',
      logo: {
        alt: 'Rage.rb Logo',
        src: 'img/logo.svg',
        srcDark: 'img/logo-dark.svg',
      },
      items: [
        {
          type: 'docSidebar',
          sidebarId: 'docsSidebar',
          position: 'left',
          label: 'Docs',
        },
        {to: '/api', label: 'API', position: 'left'},
        {to: '/blog', label: 'Blog', position: 'left'},
        {
          href: 'https://github.com/rage-rb/rage',
          position: 'right',
          "aria-label": 'GitHub',
          className: "header--github-link",
        },
      ],
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
      additionalLanguages: ["ruby", "bash", "diff"],
    },
    algolia: {
      appId: "DLTIDC3Z0R",
      apiKey: "715e231046010213465c6e8ca98e603e",
      indexName: "Documentation",
      contextualSearch: true,
    },
  } satisfies Preset.ThemeConfig,
  plugins: ["./src/plugins/tailwind"],
};

export default config;
