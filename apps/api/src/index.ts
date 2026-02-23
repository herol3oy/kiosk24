import { Hono } from 'hono'
import { bearerAuth } from 'hono/bearer-auth'
import {
  deleteUrlRoute,
  getAvailableDatesRoute,
  getImageRoute,
  getLanguagesRoute,
  getLatestRoute,
  getScreenshotsRoute,
  getStatusRoute,
  getUrlsRoute,
  postRunsRoute,
  postScreenshotsRoute,
  postUrlsRoute,
  uploadToR2Route
} from './handlers'

export interface Env {
  API_KEY: string;
  D1: D1Database;
  R2_BUCKET: R2Bucket;
}

const app = new Hono<{ Bindings: Env }>()

app.get('/', (c) => c.json({ status: 'ok', service: 'kiosk24' }))

app.on(['POST', 'PUT', 'DELETE', 'PATCH'], '*', async (c, next) => {
  if (!c.env.API_KEY) {
    return c.json({ error: 'Server misconfiguration: API_KEY is missing' }, 500)
  }
  const auth = bearerAuth({ token: c.env.API_KEY })
  return auth(c, next)
})

app.get('/urls', ...getUrlsRoute)
app.post('/urls', ...postUrlsRoute)
app.delete('/urls/:id', ...deleteUrlRoute)

app.get('/screenshots', ...getScreenshotsRoute)
app.post('/screenshots', ...postScreenshotsRoute)
app.post('/upload-screenshot', ...uploadToR2Route)

app.post('/runs', ...postRunsRoute)

app.get('/latest', ...getLatestRoute)
app.get('/available-dates', ...getAvailableDatesRoute)
app.get('/languages', ...getLanguagesRoute)
app.get('/status', ...getStatusRoute)

app.get('/:key{.+$}', ...getImageRoute)

app.onError((err, c) => {
  console.error(`[Error] ${err.message}`, err)
  return c.json({ error: 'Internal Server Error' }, 500)
})

app.notFound((c) => {
  return c.json({ error: 'Not Found' }, 404)
})

export default app
