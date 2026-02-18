// @ts-check
import { defineConfig } from 'astro/config';

import cloudflare from '@astrojs/cloudflare';

import tailwindcss from '@tailwindcss/vite';

import preact from '@astrojs/preact';

export default defineConfig({
  output: 'server',
  site: 'https://kiosk24.site',

  adapter: cloudflare({
    platformProxy: {
      enabled: true
    },
    imageService: "cloudflare"
  }),

  vite: {
    plugins: [tailwindcss()]
  },

  integrations: [preact()]
});