// @ts-check
import { envField, defineConfig } from 'astro/config';

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

  integrations: [preact({ compat: true })],
  env: {
    schema: {
      PUBLIC_CDN_URL: envField.string({ 
        context: "server", 
        access: "public" 
      }),
      API_KEY: envField.string({ 
        context: "server", 
        access: "secret" 
      })
    }
  }
});