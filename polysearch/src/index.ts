/**
 * Welcome to Cloudflare Workers! This is your first worker.
 *
 * - Run `wrangler dev src/index.ts` in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your worker in action
 * - Run `wrangler publish src/index.ts --name my-worker` to publish your worker
 *
 * Learn more at https://developers.cloudflare.com/workers/
 */

import { Env, Hono } from 'hono'
import { cors } from 'hono/cors'

import { Env as CloudflareEnv, OTTER } from './utils/constants'
import { allowedOrigin } from './utils/cors'
import { doSearch, SearchQuery } from './utils/db'

// const envAdapter = env<Bindings>()

interface HonoEnv extends Env {
  Bindings: CloudflareEnv
}

const app = new Hono<HonoEnv>()

app.get('/', (c) => c.text(OTTER))

app.use('/search', cors({ origin: allowedOrigin }))

app.get('/search', async (c) => {
  const body = c.req.queries()
  // const result = await doSearch(body, c.env.POLYSEARCH_DB)
  return c.json(body)
})

app.post('/search', async (c) => {
  const body = await c.req.json<SearchQuery>()
  const result = await doSearch(body, c.env.POLYSEARCH_DB)
  return c.json(result)
})

app.post('/insert/:table', async (c) => {
  const table = c.req.param('table')
  const body = await c.req.json()
  return c.json({ table, body })
})

app.onError((err, c) => {
  console.error(`${err}`)
  return c.text(`path: ${c.req.url}`, 500)
})

export default app
