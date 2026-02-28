<div align="center">

<img src="apps/web/public/kiosk24-logo-readme.png" alt="Kiosk24 logo" width="128">

Kiosk24 (from kušk, Persian for “small pavilion” and “newsstand”) is designed to take hourly (`0 * * * *`) screenshots of news websites by taking regular screenshots across desktop and mobile device viewports . It allows users to track visual changes over time and compare different versions.

The screenshot agent runs on a Raspberry Pi 5.

I was inspired to build this project by https://youtube.com/watch?v=JTOJsU3FSD8&t=118s

![Kiosk24 in a browser](apps/web/public/kiosk24-app-screenshot.jpg)

</div>

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

* **Frontend**: [Astro][1] ([Astro joins Cloudflare][2]), [Preact][3], [Tailwind CSS][4]
* **Security**: [/dashboard protected with Cloudflare Zero Trust][5]
* **Backend**: [Hono][6] (Cloudflare Workers), [Drizzle ORM][7]
* **Database**: [Cloudflare D1][8]
* **Storage**: [Cloudflare R2][9]
* **DNS**: [Cloudflare DNS][10]
* **Image Optimization**: [Cloudflare Image Transformations][11]
* **Agent**: [Playwright][12], [tsup][13]
* **Monorepo Management**: [pnpm][14]
* **Linting/Formatting**: [Biome][15]


## Local Development

### Prerequisites

* **Node.js**
* **pnpm**

**1. Clone & Install**
```bash
git clone https://github.com/herol3oy/kiosk24.git
cd kiosk24
pnpm install
```

**2. Generate API Key**

```bash
openssl rand -base64 32
```

**3. Setup Environment Variables**


* **`agent/.env`**
  ```env
  API_BASE_URL=http://localhost:8787
  API_KEY=<generated_key>
  ```
* **`api/.env`**
  ```env
  CLOUDFLARE_ACCOUNT_ID=
  CLOUDFLARE_DATABASE_ID=
  CLOUDFLARE_D1_TOKEN=
  API_KEY=<generated_key>
  ```
* **`web/.env`**
  ```env
  PUBLIC_CDN_URL=http://localhost:8787
  API_KEY=<generated_key>
  ```

**4. Initialize the Database**
```bash
cd apps/api
npx wrangler d1 migrations apply kiosk24 
```

**5. Run the Stack**

```bash
pnpm --parallel --filter api --filter web run dev
```

**6. Configure & Start Agent**
1. Go to [http://localhost:4321/dashboard](http://localhost:4321/dashboard)
2. Add URLs and languages.
3. Start the agent:
```bash
pnpm --filter agent run dev
```

[1]: https://astro.build/
[2]: https://blog.cloudflare.com/astro-joins-cloudflare/
[3]: https://preactjs.com/
[4]: https://tailwindcss.com/
[5]: https://www.cloudflare.com/products/zero-trust/
[6]: https://hono.dev/
[7]: https://orm.drizzle.team/docs/get-started/d1-new
[8]: https://developers.cloudflare.com/d1/
[9]: https://developers.cloudflare.com/r2/
[10]: https://cloudflare.com/application-services/products/dns/
[11]: https://developers.cloudflare.com/images/transform-images/
[12]: https://playwright.dev/
[13]: https://tsup.egoist.dev/
[14]: https://pnpm.io/
[15]: https://biomejs.dev/
