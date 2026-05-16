import { defineConfig, passthroughImageService } from 'astro/config';
import starlight from '@astrojs/starlight';
import react from '@astrojs/react';

export default defineConfig({
  site: 'https://drenther.github.io',
  base: '/react-emoji-text',
  image: { service: passthroughImageService() },
  integrations: [
    starlight({
      title: 'react-emoji-text',
      social: [
        {
          icon: 'github',
          label: 'GitHub',
          href: 'https://github.com/drenther/react-emoji-text',
        },
      ],
      sidebar: [
        {
          label: 'Guides',
          items: [
            { slug: 'guides/getting-started' },
            { slug: 'guides/custom-rendering' },
            { slug: 'guides/image-rendering' },
            { slug: 'guides/skin-tones' },
            { slug: 'guides/custom-emojis' },
            { slug: 'guides/extra-aliases' },
            { slug: 'guides/ascii-emoticons' },
          ],
        },
        {
          label: 'Reference',
          items: [{ slug: 'reference/core-api' }, { slug: 'reference/compat-api' }],
        },
      ],
    }),
    react(),
  ],
});
