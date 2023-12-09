import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { allowedOrigin } from './utils/cors'
import { HonoEnv } from './utils/constants'
import { watchlist } from './routes/watchlist'
import { watchlistItem } from './routes/watchlist-item'

const app = new Hono<HonoEnv>()

app.use('*', cors({ origin: allowedOrigin }))

app.get('/', async (ctx) => {
  return ctx.text('KODADOT WATCHLIST SERVICE - https://kodadot.xyz')
})

app.route('/:chain/:type', watchlist)
app.route('/:chain/:type/:id', watchlistItem)

app.onError((err, c) => {
  console.error(`${err}`)
  return c.json({ error: err.message, path: c.req.url }, 400)
})

export default app
