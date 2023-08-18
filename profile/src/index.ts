import { Env, Hono } from 'hono'
import { cors } from 'hono/cors'

import { addressOf } from './utils/accounts'
import { Env as CloudflareEnv, OTTER } from './utils/constants'
import { allowedOrigin } from './utils/cors'
import { SearchQuery, doSearch, findByHandle, findById, save } from './utils/db'
import { SignatureRequest, isSignatureValid } from './utils/external'
import { profiles } from './routes/profiles'
import { socials } from './routes/socials'
import { quests } from './routes/quests'

interface HonoEnv extends Env {
  Bindings: CloudflareEnv
}

const app = new Hono<HonoEnv>()

app.get('/', (c) => c.text(OTTER))
app.route('/profiles', profiles)
app.route('/socials', socials)
app.route('/quests', quests)


app.use('/u/:id', cors({ origin: allowedOrigin }))

app.get('/u/:id', async (c) => {
  const id = c.req.param('id')
  const handle = id.replace('@', '')
  const result = await findByHandle(handle, 'accounts', c.env.PROFILE_DB)
  return c.json(result)
})



app.post('/search', async (c) => {
  const body = await c.req.json<SearchQuery>()
  const result = await doSearch(body, c.env.POLYSEARCH_DB)
  return c.json(result)
})

app.post('/verify', async (c) => {
  const body = await c.req.json<SignatureRequest>()
  const result = addressOf(body.address)
  return c.json(result)
})

// app.post('/insert/:table', async (c) => {
//   const table = c.req.param('table')
//   const body = await c.req.json()

//   if (!isTable(table) || !body) {
//     return c.text('table is required', 400)
//   }
//   const result = await insertInto(table, body, c.env.POLYSEARCH_DB)
//   return c.json(result)
// })

app.onError((err, c) => {
  console.error(`${err}`)
  return c.json({ error: err.message, path: c.req.url }, 400)
})

export default app
