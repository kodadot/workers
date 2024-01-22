import { Hono } from 'hono'
import { HonoEnv } from '../utils/constants'
import {
  createWatchlist,
  deleteWatchlistById,
  getOrCreateDefaultWatchlist,
  getWatchlistById,
  searchWatchlist,
  setDefaultWatchlist,
  updateWatchlist,
} from '../utils/db'
import { watchlistCreateParamsValidator } from '../middleware/validator'
import { ensureWatchlistIdExists } from '../middleware/ensureWatchlistIdExists'

const app = new Hono<HonoEnv>()

app.get('/', async (c) => {
  const { isDefault } = c.req.query()
  const address = c.get('validatedAddress')

  const searchQuery = {
    isDefault: (isDefault === '1' ? 1 : 0) as 0 | 1,
    address,
  }
  const result = await searchWatchlist(searchQuery, c.env.DB)

  return c.json(result)
})

app.post('/', watchlistCreateParamsValidator(), async (c) => {
  const address = c.get('validatedAddress')
  const { name, isDefault = 0 } = c.req.valid('json')

  const createParams = {
    address,
    name,
    isDefault,
  }

  const result = await createWatchlist(createParams, c.env.DB)

  return c.json(result)
})

app.get('/default', async (c) => {
  const address = c.get('validatedAddress')
  const result = await getOrCreateDefaultWatchlist({ address }, c.env.DB)
  return c.json(result)
})

app.get('/:watchlistId{\\d+}', ensureWatchlistIdExists(), async (c) => {
  const { watchlistId } = c.req.param()
  const result = await getWatchlistById(Number(watchlistId), c.env.DB)
  return c.json(result)
})

app.put('/:watchlistId{\\d+}', ensureWatchlistIdExists(), watchlistCreateParamsValidator(), async (c) => {
  const address = c.get('validatedAddress')
  const { watchlistId } = c.req.param()
  const { name } = c.req.valid('json')

  const body = {
    address,
    name,
    id: Number(watchlistId),
  }

  const result = await updateWatchlist(body, c.env.DB)

  return c.json(result)
})

app.put('/:watchlistId{\\d+}/set-default', ensureWatchlistIdExists(), async (c) => {
  const address = c.get('validatedAddress')
  const { watchlistId } = c.req.param()
  await setDefaultWatchlist({ address, id: Number(watchlistId) }, c.env.DB)
  return c.json({ ok: true })
})

app.delete('/:watchlistId{\\d+}', ensureWatchlistIdExists(), async (c) => {
  const watchlistId = Number(c.req.param('watchlistId'))

  const watchlist = await getWatchlistById(watchlistId, c.env.DB)
  if (watchlist.isDefault) {
    return c.json({ error: 'cannot delete default watchlist' }, 400)
  }

  await deleteWatchlistById(watchlistId, c.env.DB)
  return c.json({ ok: true })
})

export { app as watchlist }
