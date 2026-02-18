import { Hono } from 'hono'
import { drizzle } from 'drizzle-orm/d1'
import { screenshotsTable, urlsTable } from './db/schema'
import { bearerAuth } from 'hono/bearer-auth'
import { eq, and, sql, desc } from 'drizzle-orm'

export interface Env {
  API_KEY: string;
  D1: D1Database;
  R2_BUCKET: R2Bucket;
}

const app = new Hono<{ Bindings: Env }>()

app.use('*', async (c, next) => {
  if (c.req.method !== 'GET') {
    const auth = bearerAuth({ token: c.env.API_KEY })
    return auth(c, next)
  }
  return next()
})

app.get('/urls', async (c) => {
  const db = drizzle(c.env.D1)
  const rows = await db.select().from(urlsTable).all()
  return c.json(rows)
})

app.post('/urls', async (c) => {
  const db = drizzle(c.env.D1)
  const body = await c.req.json<{
    id?: string
    url: string
    language: string
  }>()

  if (!body?.url || !body?.language) {
    return c.json({ error: 'url and language are required' }, 400)
  }

  const id = body.id ?? crypto.randomUUID()

  await db
    .insert(urlsTable)
    .values({ id, url: body.url, language: body.language })
    .run()

  return c.json({ id, url: body.url, language: body.language }, 201)
})

app.delete('/urls/:id', async (c) => {
  const db = drizzle(c.env.D1)
  const id = c.req.param('id')

  const result = await db
    .delete(urlsTable)
    .where(eq(urlsTable.id, id))
    .run()

  if (result.meta.changes === 0) {
    return c.json({ error: 'URL not found' }, 404)
  }

  return c.json({ success: true, deletedId: id }, 200)
})

app.get('/screenshots', async (c) => {
  const db = drizzle(c.env.D1);

  const urlParam = c.req.query('url');
  const dateParam = c.req.query('date');
  const deviceParam = c.req.query('device');

  const filters = [];

  if (urlParam) {
    filters.push(eq(screenshotsTable.url, urlParam));
  }

  if (dateParam) {
    filters.push(sql`date(${screenshotsTable.created_at}) = ${dateParam}`);
  }

  if (deviceParam) {
    filters.push(eq(screenshotsTable.device, deviceParam as 'desktop' | 'mobile'));
  }

  const results = await db
    .select()
    .from(screenshotsTable)
    .where(filters.length > 0 ? and(...filters) : undefined)
    .orderBy(sql`${screenshotsTable.created_at} DESC`)

  return c.json(results);
});

app.post('/screenshots', async (c) => {
  const db = drizzle(c.env.D1)
  const body = await c.req.json<{
    id?: string
    url: string
    language: string
    device: 'desktop' | 'mobile'
    job_status: 'ok' | 'failed'
    r2_key: string
    created_at: string
  }>()

  if (
    !body?.url ||
    !body?.language ||
    !body?.device ||
    !body?.job_status ||
    !body?.r2_key ||
    !body?.created_at
  ) {
    return c.json(
      {
        error:
          'url, language, device, job_status, r2_key, and created_at are required',
      },
      400
    )
  }

  const id = body.id ?? crypto.randomUUID()

  await db
    .insert(screenshotsTable)
    .values({
      id,
      url: body.url,
      language: body.language,
      device: body.device,
      job_status: body.job_status,
      r2_key: body.r2_key,
      created_at: body.created_at,
    })
    .run()

  return c.json(
    {
      id,
      url: body.url,
      language: body.language,
      device: body.device,
      job_status: body.job_status,
      r2_key: body.r2_key,
      created_at: body.created_at,
    },
    201
  )
})

app.post('/upload_to_r2_bucket', async (c) => {
  let body
  try {
    body = await c.req.parseBody()
  } catch (e) {
    return c.json({ error: 'Failed to parse body' }, 400)
  }

  const imageFile = body['image']
  const url = body['url'] as string | undefined
  const language = body['language'] as string | undefined
  const objectKey = body['objectKey'] as string | undefined
  const deviceName = body['deviceName'] as string | undefined
  const jobStatus = (body['jobStatus'] as string) || 'ok'
  const capturedAt = body['capturedAt'] as string | undefined

  if (!url || !language || !deviceName || !capturedAt) {
    return c.json(
      { error: 'url, language, deviceName, and capturedAt are required' },
      400
    )
  }

  if (jobStatus === 'ok') {
    if (!objectKey) {
        return c.json({ error: 'objectKey is required for successful jobs' }, 400)
    }
    if (!imageFile || !(imageFile instanceof File)) {
        return c.json({ error: 'No image file provided for successful job' }, 400)
    }
  }

  if (deviceName !== 'desktop' && deviceName !== 'mobile') {
    return c.json({ error: 'deviceName must be desktop or mobile' }, 400)
  }

  const db = drizzle(c.env.D1)

  try {
    if (jobStatus === 'ok' && imageFile instanceof File && objectKey) {
      await c.env.R2_BUCKET.put(objectKey, await imageFile.arrayBuffer(), {
        httpMetadata: {
          contentType: imageFile.type || 'image/jpeg',
        },
      })
      console.log(`Successfully uploaded image: ${objectKey}`)
    } else {
      console.log(`Job failed. Skipping R2 upload.`)
    }
    await db
      .insert(screenshotsTable)
      .values({
        id: crypto.randomUUID(),
        url,
        language,
        device: deviceName as 'desktop' | 'mobile',
        job_status: jobStatus as 'ok' | 'failed',
        r2_key: objectKey || null, 
        created_at: capturedAt,
      })
      .run()

    console.log(`Saved metadata to DB with status: ${jobStatus}`)
    return c.json({ success: true, key: objectKey, status: jobStatus })

  } catch (error) {
    console.error('Operation failed:', error)
    return c.json({ success: false, error: String(error) }, 500)
  }
})

app.get('/latest', async (c) => {
  const db = drizzle(c.env.D1)
  const deviceType = c.req.query('device') === 'mobile' ? 'mobile' : 'desktop'

  const latestSubquery = db
    .select({
      url: screenshotsTable.url,
      language: screenshotsTable.language,
      device: screenshotsTable.device,
      maxCreatedAt: sql<string>`MAX(${screenshotsTable.created_at})`.as('max_created_at'),
    })
    .from(screenshotsTable)
    .where(eq(screenshotsTable.device, deviceType))
    .groupBy(
      screenshotsTable.url,
      screenshotsTable.language,
      screenshotsTable.device
    )
    .as('sq')

  const results = await db
    .select()
    .from(screenshotsTable)
    .innerJoin(
      latestSubquery,
      and(
        eq(screenshotsTable.url, latestSubquery.url),
        eq(screenshotsTable.language, latestSubquery.language),
        eq(screenshotsTable.device, latestSubquery.device),
        eq(screenshotsTable.created_at, latestSubquery.maxCreatedAt)
      )
    )

  const cleanData = results.map((row) => row.screenshots_table)

  return c.json(cleanData)
})

app.get('/languages', async (c) => {
  const db = drizzle(c.env.D1)

  try {
    const result = await db
      .selectDistinct({ language: screenshotsTable.language })
      .from(screenshotsTable)
      .orderBy(screenshotsTable.language)

    const languages = result.map((row) => row.language)

    return c.json(languages)
  } catch (error) {
    return c.json({ error: 'Failed to fetch languages' }, 500)
  }
})

app.get('/available-dates', async (c) => {
  const db = drizzle(c.env.D1)
  const urlParam = c.req.query('url')

  try {
    const filters = []
    
    if (urlParam) {
      filters.push(eq(screenshotsTable.url, urlParam))
    }

    const results = await db
      .selectDistinct({
        date: sql<string>`date(${screenshotsTable.created_at})`
      })
      .from(screenshotsTable)
      .where(filters.length > 0 ? and(...filters) : undefined)
      .orderBy(desc(sql`date(${screenshotsTable.created_at})`))

    const dateList = results.map((r) => r.date)

    return c.json(dateList)
  } catch (error) {
    console.error('Failed to fetch dates:', error)
    return c.json({ error: 'Failed to fetch available dates' }, 500)
  }
})

app.get('/:key{.+$}', async (c) => {
  const key = c.req.param('key')

  const object = await c.env.R2_BUCKET.get(key)

  if (!object) {
    return c.text('Image not found', 404)
  }

  const headers = new Headers()
  object.writeHttpMetadata(headers)
  headers.set('etag', object.httpEtag)

  return new Response(object.body, {
    headers,
  })
})


export default app
