import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import sidebar from './src/starlight-sidebar';

// https://astro.build/config
export default defineConfig({
  site: 'https://graph-of-plan.pages.dev',
  integrations: [
    starlight({
      title: 'Graph of Plan',
      favicon: '/favicon.svg',
      social: {
        github: 'https://github.com/Captain-App/graph-of-plan',
      },
      sidebar: sidebar,
      customCss: ['./src/styles/custom.css'],
      head: [
        {
          tag: 'meta',
          attrs: {
            property: 'og:image',
            content: '/favicon.svg',
          },
        },
        {
          tag: 'meta',
          attrs: {
            name: 'twitter:card',
            content: 'summary',
          },
        },
      ],
    }),
  ],
});
