import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import sidebar from './src/starlight-sidebar';

// https://astro.build/config
export default defineConfig({
  site: 'https://graph-of-plan.pages.dev',
  integrations: [
    starlight({
      title: 'Graph of Plan',
      social: {
        github: 'https://github.com/Captain-App/graph-of-plan',
      },
      sidebar: sidebar,
    }),
  ],
});
