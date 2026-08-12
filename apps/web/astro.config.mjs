// @ts-check

import cloudflare from "@astrojs/cloudflare";
import preact from "@astrojs/preact";
import sitemap from "@astrojs/sitemap";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig, envField } from "astro/config";

export default defineConfig({
	output: "server",
	site: "https://kiosk24.site",

	adapter: cloudflare({
		platformProxy: {
			enabled: true,
		},
		imageService: "cloudflare",
	}),

	vite: {
		plugins: [tailwindcss()],
	},

	integrations: [preact({ compat: true }), sitemap()],
	env: {
		schema: {
			PUBLIC_CDN_URL: envField.string({
				context: "server",
				access: "public",
			}),
			API_KEY: envField.string({
				context: "server",
				access: "secret",
			}),
		},
	},
});
