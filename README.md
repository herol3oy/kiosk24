# kiosk24

Kiosk24 is designed to monitor a list of URLs by taking regular screenshots across different device viewports (desktop and mobile). It allows users to track visual changes over time and compare different versions.

## Project Structure

This project is a monorepo containing the following applications:

- **[apps/agent](./apps/agent)**: A Playwright-based screenshot agent that captures website screenshots.
- **[apps/api](./apps/api)**: A Hono-based backend API running on Cloudflare Workers, managing URLs and screenshot metadata.
- **[apps/web](./apps/web)**: An Astro-based frontend for viewing and comparing captured screenshots.
- **[libs/shared](./libs/shared)**: Shared TypeScript types and utilities.

### Workflow

1.  **API**: Stores the target URLs and records screenshot metadata in a Cloudflare D1 database.
2.  **Agent**: Periodically (or on-demand) fetches URLs from the API, uses Playwright to capture screenshots, and uploads them to Cloudflare R2 via the API.
3.  **Web**: Provides a user interface to browse the screenshot history, filter by date and device, and compare screenshots.

## Tech Stack

- **Frontend**: [Astro](https://astro.build/), [Preact](https://preactjs.com/), [Tailwind CSS](https://tailwindcss.com/)
- **Backend**: [Hono](https://hono.dev/) (Cloudflare Workers), [Drizzle ORM](https://orm.drizzle.team/)
- **Database**: [Cloudflare D1](https://developers.cloudflare.com/d1/)
- **Storage**: [Cloudflare R2](https://developers.cloudflare.com/r2/)
- **Agent**: [Playwright](https://playwright.dev/), [tsup](https://tsup.egoist.dev/)
- **Monorepo Management**: [pnpm](https://pnpm.io/)
- **Linting/Formatting**: [Biome](https://biomejs.dev/)
