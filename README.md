# kiosk24

Kiosk24 (from Persian kušk, small garden) is designed to monitor a list of URLs by taking regular screenshots across desktop and mobile device viewports . It allows users to track visual changes over time and compare different versions.

I was inspired to build this project by https://youtube.com/watch?v=JTOJsU3FSD8&t=118s


## Project Structure

This project is a monorepo:

- **[apps/agent](./apps/agent)**: A Playwright-based screenshot
- **[apps/api](./apps/api)**: A Hono-based backend API running on Cloudflare Workers
- **[apps/web](./apps/web)**: An Astro-based frontend 
- **[libs/shared](./libs/shared)**: Shared TypeScript types, Drizzle ORM and zod
```mermaid

%%{init: {
  "theme": "base",
  "themeVariables": {
    "fontFamily": "Inter, Segoe UI, sans-serif",
    "primaryColor": "#4F46E5",
    "primaryTextColor": "#ffffff",
    "primaryBorderColor": "#4338CA",
    "lineColor": "#64748B",
    "secondaryColor": "#0EA5E9",
    "tertiaryColor": "#F1F5F9"
  }
}}%%

graph LR

    subgraph PI["Raspberry Pi 5"]
        Agent["Agent"]
    end

    subgraph CF["Cloudflare"]
        API["API"]

            D1[("D1 Database")]
            R2[("R2 Storage")]
    end

    subgraph Browser["Browser"]
        Web["Frontend"]
    end

    Agent ==>|Sends Screenshots| API
    API ==>|Provides URLs| Agent
    Web ==>|Requests| API

    API -->|Stores Metadata| D1
    API -->|Stores Images| R2

    classDef compute fill:#EEF2FF,stroke:#4338CA,stroke-width:2px,color:#111827;
    classDef cloud fill:#E0F2FE,stroke:#0284C7,stroke-width:2px,color:#0C4A6E;
    classDef storage fill:#F8FAFC,stroke:#94A3B8,stroke-width:2px,color:#334155;
    classDef browser fill:#ECFDF5,stroke:#059669,stroke-width:2px,color:#065F46;

    class Agent compute;
    class API cloud;
    class D1,R2 storage;
    class Web browser;
```

## Tech Stack

- **Frontend**: [Astro](https://astro.build/), [Preact](https://preactjs.com/), [Tailwind CSS](https://tailwindcss.com/)
- **Backend**: [Hono](https://hono.dev/) (Cloudflare Workers), [Drizzle ORM](https://orm.drizzle.team/)
- **Database**: [Cloudflare D1](https://developers.cloudflare.com/d1/)
- **Storage**: [Cloudflare R2](https://developers.cloudflare.com/r2/)
- **Agent**: [Playwright](https://playwright.dev/), [tsup](https://tsup.egoist.dev/)
- **Monorepo Management**: [pnpm](https://pnpm.io/)
- **Linting/Formatting**: [Biome](https://biomejs.dev/)
