import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { allowedOrigin } from './utils/cors'
import { HonoEnv } from './utils/constants'
import { watchlist } from './routes/watchlist'
import { watchlistItem } from './routes/watchlist-item'
import { ensureWatchlistIdExists } from './middleware/ensureWatchlistIdExists'
import { authAddressExtractor } from './middleware/authAddressExtractor'

const app = new Hono<HonoEnv>()

app.use('*', cors({ origin: allowedOrigin }))
app.use('/watchlists/*', authAddressExtractor())
app.use('/watchlists/:watchlistId{^\\d+$}/*', ensureWatchlistIdExists())

app.get('/', async (ctx) => {
  return ctx.text('KODADOT WATCHLIST SERVICE - https://kodadot.xyz')
})

app.route('/watchlists', watchlist)
app.route('/watchlists/:watchlistId{^(default|\\d+)$}/chains/:chain/items', watchlistItem)

app.onError((err, c) => {
  console.error(`${err}`)
  return c.json({ error: err.message, path: c.req.url }, 400)
})

export default app
