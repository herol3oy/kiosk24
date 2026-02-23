import { and, desc, eq, sql } from 'drizzle-orm'
import { drizzle } from 'drizzle-orm/d1'
import type { Context } from 'hono'
import { createRunApiSchema, createScreenshotApiSchema, getAvailableDatesQuerySchema, getLatestQuerySchema, getScreenshotsQuerySchema, keyParamSchema, runsTable, screenshotsTable, uploadScreenshotSchema, urlParamSchema, urlsTable } from '@kiosk24/shared';
import type { Env } from './index'
import { createFactory } from 'hono/factory';
import { zValidator } from '@hono/zod-validator';
import { insertUrlSchema } from '@kiosk24/shared'

const factory = createFactory<{ Bindings: Env }>()

export const getUrls = async (c: Context<{ Bindings: Env }>) => {
  const db = drizzle(c.env.D1)
  const rows = await db.select().from(urlsTable).all()
  return c.json(rows)
}

export const postUrlsRoute = factory.createHandlers(
  zValidator('json', insertUrlSchema),
  async (c) => {
    const db = drizzle(c.env.D1)

    const body = c.req.valid('json')

    const id = body.id ?? crypto.randomUUID()

    await db
      .insert(urlsTable)
      .values({ id, url: body.url, language: body.language })
      .run()

    return c.json({ id, url: body.url, language: body.language }, 201)
  }
)

export const deleteUrl = async (c: Context<{ Bindings: Env }>) => {
  const db = drizzle(c.env.D1)
  const id = c.req.param('id')

  await db
    .delete(screenshotsTable)
    .where(eq(screenshotsTable.url_id, id))
    .run()

  const result = await db
    .delete(urlsTable)
    .where(eq(urlsTable.id, id))
    .run()

  if (result.meta.changes === 0) {
    return c.json({ error: 'URL not found' }, 404)
  }

  return c.json({ success: true, deletedId: id }, 200)
}

export const getScreenshotsRoute = factory.createHandlers(
  zValidator('query', getScreenshotsQuerySchema),
  async (c) => {
    const db = drizzle(c.env.D1);

    // 1. Get validated query parameters!
    const query = c.req.valid('query');

    const filters = [];

    if (query.url) {
      filters.push(eq(urlsTable.url, query.url));
    }

    if (query.date) {
      filters.push(sql`date(${screenshotsTable.created_at}) = ${query.date}`);
    }

    if (query.device) {
      // No more "as 'desktop' | 'mobile'" casting needed! Zod typed this for us.
      filters.push(eq(screenshotsTable.device, query.device));
    }

    const results = await db
      .select({
        id: screenshotsTable.id,
        url_id: screenshotsTable.url_id,
        url: urlsTable.url,
        language: urlsTable.language,
        device: screenshotsTable.device,
        job_status: screenshotsTable.job_status,
        r2_key: screenshotsTable.r2_key,
        created_at: screenshotsTable.created_at,
      })
      .from(screenshotsTable)
      .innerJoin(urlsTable, eq(screenshotsTable.url_id, urlsTable.id))
      .where(filters.length > 0 ? and(...filters) : undefined)
      .orderBy(sql`${screenshotsTable.created_at} DESC`)

    return c.json(results);
  }
)

export const postScreenshots = async (c: Context<{ Bindings: Env }>) => {
  const db = drizzle(c.env.D1)
  const body = await c.req.json<{
    id?: string
    url_id: string
    device: 'desktop' | 'mobile'
    job_status: 'ok' | 'failed'
    r2_key: string | null
    created_at: string
  }>()

  if (
    !body?.url_id ||
    !body?.device ||
    !body?.job_status ||
    !body?.created_at
  ) {
    return c.json(
      {
        error:
          'url_id, device, job_status, and created_at are required',
      },
      400
    )
  }

  const id = body.id ?? crypto.randomUUID()

  await db
    .insert(screenshotsTable)
    .values({
      id,
      url_id: body.url_id,
      device: body.device,
      job_status: body.job_status,
      r2_key: body.r2_key,
      created_at: body.created_at,
    })
    .run()

  return c.json(
    {
      id,
      url_id: body.url_id,
      device: body.device,
      job_status: body.job_status,
      r2_key: body.r2_key,
      created_at: body.created_at,
    },
    201
  )
}

export const postScreenshotsRoute = factory.createHandlers(
  zValidator('json', createScreenshotApiSchema),
  async (c) => {
    const db = drizzle(c.env.D1)

    // Validated payload! No manual null checks needed.
    const body = c.req.valid('json')

    const id = body.id ?? crypto.randomUUID()

    await db
      .insert(screenshotsTable)
      .values({
        id,
        url_id: body.url_id,
        device: body.device,
        job_status: body.job_status,
        r2_key: body.r2_key,
        created_at: body.created_at,
      })
      .run()

    return c.json(
      {
        id,
        url_id: body.url_id,
        device: body.device,
        job_status: body.job_status,
        r2_key: body.r2_key,
        created_at: body.created_at,
      },
      201
    )
  }
)

export const postRunsRoute = factory.createHandlers(
  zValidator('json', createRunApiSchema),
  async (c) => {
    const db = drizzle(c.env.D1)

    const body = c.req.valid('json')

    const id = crypto.randomUUID()

    await db
      .insert(runsTable)
      .values({
        id,
        total_screenshots: body.total_screenshots,
        completed_screenshots: body.completed_screenshots,
        failed_screenshots: body.failed_screenshots,
        total_urls: body.total_urls,
        started_at: body.started_at,
        completed_at: body.completed_at,
      })
      .run()

    return c.json({ success: true, id }, 201)
  }
)

export const uploadToR2Route = factory.createHandlers(
  zValidator('form', uploadScreenshotSchema),
  async (c) => {
    const db = drizzle(c.env.D1)

    const body = c.req.valid('form')

    try {
      if (body.jobStatus === 'ok' && body.image && body.objectKey) {
        await c.env.R2_BUCKET.put(body.objectKey, await body.image.arrayBuffer(), {
          httpMetadata: {
            contentType: body.image.type || 'image/jpeg',
          },
        })
        console.log(`Successfully uploaded image: ${body.objectKey}`)
      } else {
        console.log(`Job failed. Skipping R2 upload.`)
      }

      await db
        .insert(screenshotsTable)
        .values({
          id: crypto.randomUUID(),
          url_id: body.url_id,
          device: body.deviceName,
          job_status: body.jobStatus,
          r2_key: body.objectKey || null,
          created_at: body.capturedAt,
        })
        .run()

      console.log(`Saved metadata to DB with status: ${body.jobStatus}`)
      return c.json({ success: true, key: body.objectKey, status: body.jobStatus })

    } catch (error) {
      console.error('Operation failed:', error)
      return c.json({ success: false, error: String(error) }, 500)
    }
  }
)

export const getLatestRoute = factory.createHandlers(
  zValidator('query', getLatestQuerySchema),
  async (c) => {
    const db = drizzle(c.env.D1)
    const query = c.req.valid('query');

    const deviceType = query.device === 'mobile' ? 'mobile' : 'desktop'

    const latestSubquery = db
      .select({
        url_id: screenshotsTable.url_id,
        device: screenshotsTable.device,
        maxCreatedAt: sql<string>`MAX(${screenshotsTable.created_at})`.as('max_created_at'),
      })
      .from(screenshotsTable)
      .where(eq(screenshotsTable.device, deviceType))
      .groupBy(
        screenshotsTable.url_id,
        screenshotsTable.device
      )
      .as('sq')

    const results = await db
      .select({
        id: screenshotsTable.id,
        url_id: screenshotsTable.url_id,
        url: urlsTable.url,
        language: urlsTable.language,
        device: screenshotsTable.device,
        job_status: screenshotsTable.job_status,
        r2_key: screenshotsTable.r2_key,
        created_at: screenshotsTable.created_at,
      })
      .from(screenshotsTable)
      .innerJoin(urlsTable, eq(screenshotsTable.url_id, urlsTable.id))
      .innerJoin(
        latestSubquery,
        and(
          eq(screenshotsTable.url_id, latestSubquery.url_id),
          eq(screenshotsTable.device, latestSubquery.device),
          eq(screenshotsTable.created_at, latestSubquery.maxCreatedAt)
        )
      )

    return c.json(results)
  }
)

export const getAvailableDatesRoute = factory.createHandlers(
  zValidator('query', getAvailableDatesQuerySchema),
  async (c) => {
    const db = drizzle(c.env.D1)
    const query = c.req.valid('query');

    try {
      const filters = []
      if (query.url) {
        filters.push(eq(urlsTable.url, query.url))
      }

      const results = await db
        .selectDistinct({
          date: sql<string>`date(${screenshotsTable.created_at})`
        })
        .from(screenshotsTable)
        .innerJoin(urlsTable, eq(screenshotsTable.url_id, urlsTable.id))
        .where(filters.length > 0 ? and(...filters) : undefined)
        .orderBy(desc(sql`date(${screenshotsTable.created_at})`))

      const dateList = results.map((r) => r.date)
      return c.json(dateList)
    } catch (error) {
      console.error('Failed to fetch dates:', error)
      return c.json({ error: 'Failed to fetch available dates' }, 500)
    }
  }
)

export const deleteUrlRoute = factory.createHandlers(
  zValidator('param', urlParamSchema),
  async (c) => {
    const db = drizzle(c.env.D1)
    
    const { id } = c.req.valid('param')

    await db
      .delete(screenshotsTable)
      .where(eq(screenshotsTable.url_id, id))
      .run()

    const result = await db
      .delete(urlsTable)
      .where(eq(urlsTable.id, id))
      .run()

    if (result.meta.changes === 0) {
      return c.json({ error: 'URL not found' }, 404)
    }

    return c.json({ success: true, deletedId: id }, 200)
  }
)

export const getImageRoute = factory.createHandlers(
  zValidator('param', keyParamSchema),
  async (c) => {
    const { key } = c.req.valid('param')

    const object = await c.env.R2_BUCKET.get(key)

    if (!object) {
      return c.text('Image not found', 404)
    }

    const headers = new Headers()
    object.writeHttpMetadata(headers)
    headers.set('etag', object.httpEtag)

    return new Response(object.body, { headers })
  }
)

export const getUrlsRoute = factory.createHandlers(async (c) => {
  const db = drizzle(c.env.D1)
  const rows = await db.select().from(urlsTable).all()
  return c.json(rows)
})

export const getLanguagesRoute = factory.createHandlers(async (c) => {
  const db = drizzle(c.env.D1)
  try {
    const result = await db
      .selectDistinct({ language: urlsTable.language })
      .from(urlsTable)
      .orderBy(urlsTable.language)

    const languages = result.map((row) => row.language)
    return c.json(languages)
  } catch (error) {
    console.error('Failed to fetch languages:', error)
    return c.json({ error: 'Failed to fetch languages' }, 500)
  }
})

export const getStatusRoute = factory.createHandlers(async (c) => {
  const db = drizzle(c.env.D1)
  const runs = await db
    .select()
    .from(runsTable)
    .orderBy(desc(runsTable.completed_at))
    .limit(100)
    .all()

  return c.json(runs.map(run => ({
    total_screenshots: run.total_screenshots,
    completed_screenshots: run.completed_screenshots,
    failed_screenshots: run.failed_screenshots,
    total_urls: run.total_urls,
    job_start_timestamp: run.started_at,
    job_completion_timestamp: run.completed_at,
  })))
})




