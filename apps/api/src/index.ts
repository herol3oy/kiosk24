import { Hono } from 'hono'
import { bearerAuth } from 'hono/bearer-auth'

import {
  deleteUrl,
  getAvailableDates,
  getImage,
  getLanguages,
  getLatest,
  getScreenshots,
  getStatus,
  getUrls,
  postRuns,
  postScreenshots,
  postUrls,
  uploadToR2
} from './handlers'

export interface Env {
  API_KEY: string;
  D1: D1Database;
  R2_BUCKET: R2Bucket;
}

const app = new Hono<{ Bindings: Env }>()

app.on(['POST', 'PUT', 'DELETE', 'PATCH'], '*', async (c, next) => {
  const auth = bearerAuth({ token: c.env.API_KEY })
  return auth(c, next)
})

app.get('/', (c) => c.json({ status: 'ok', service: 'kiosk24' }))

app.get('/urls', getUrls)
app.post('/urls', postUrls)
app.delete('/urls/:id', deleteUrl)

app.get('/screenshots', getScreenshots)
app.post('/screenshots', postScreenshots)

app.post('/upload-screenshot', uploadToR2)

app.get('/latest', getLatest)

app.get('/languages', getLanguages)

app.get('/available-dates', getAvailableDates)

app.get('/status', getStatus)

app.post('/runs', postRuns)

app.get('/:key{.+$}', getImage)

export default app
