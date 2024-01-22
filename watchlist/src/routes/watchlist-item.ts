import { Hono } from 'hono'
import { HonoEnv } from '../utils/constants'
import {
  countWatchlistItems,
  createWatchlistItem,
  deleteWatchlistItem,
  getDefaultWatchlist,
  getOrCreateDefaultWatchlist,
  getWatchlistById,
  searchWatchlistItems,
} from '../utils/db'
import { watchlistItemCreateParamsValidator } from '../middleware/validator'

const app = new Hono<HonoEnv, {}, '/watchlists/:watchlistId/chains/:chain/items'>()

app.get('/', async (c) => {
  const { watchlistId, chain } = c.req.param()
  const { type, limit, offset } = c.req.query()
  const address = c.get('validatedAddress')

  const searchQuery = { address, chain, type, watchlistId: Number(watchlistId) }

  if (watchlistId === 'default') {
    const defaultWatchlist = await getDefaultWatchlist({ address }, c.env.DB)
    if (!defaultWatchlist) {
      return c.json({ data: [], total: 0 })
    }
    searchQuery.watchlistId = defaultWatchlist.id
  }

  const [watchlistItems, total] = await Promise.all([
    searchWatchlistItems({ ...searchQuery, limit, offset }, c.env.DB),
    countWatchlistItems({ ...searchQuery }, c.env.DB),
  ])
  return c.json({ data: watchlistItems, total })
})

app.post('/', watchlistItemCreateParamsValidator(), async (c) => {
  const address = c.get('validatedAddress')
  const { watchlistId, chain } = c.req.param()
  const { type, itemId } = c.req.valid('json')

  let watchlist
  if (watchlistId === 'default') {
    watchlist = await getOrCreateDefaultWatchlist({ address }, c.env.DB)
  } else {
    watchlist = await getWatchlistById(Number(watchlistId), c.env.DB)
  }

  const createParams = {
    watchlistId: watchlist.id,
    itemId,
    address,
    chain,
    type,
  }

  const existedResult = await searchWatchlistItems({ ...createParams, limit: 1 }, c.env.DB)

  if (existedResult.length) {
    return c.json({ error: 'item already exists' }, 409)
  }

  const info = await createWatchlistItem(createParams, c.env.DB)

  return c.json(info)
})

app.get('/:itemId/exists', async (c) => {
  const address = c.get('validatedAddress')
  const { chain, watchlistId, itemId } = c.req.param()
  const { type } = c.req.query()

  let watchlist
  if (watchlistId === 'default') {
    watchlist = await getOrCreateDefaultWatchlist({ address }, c.env.DB)
  } else {
    watchlist = await getWatchlistById(Number(watchlistId), c.env.DB)
  }

  const searchQuery = {
    address,
    chain,
    type,
    watchlistId: watchlist.id,
    itemId,
    limit: 1,
  }

  const result = await searchWatchlistItems(searchQuery, c.env.DB)

  return c.json({ exists: result.length > 0 })
})

app.delete('/:itemId', async (c) => {
  const address = c.get('validatedAddress')
  const { chain, watchlistId, itemId } = c.req.param()

  let watchlist
  if (watchlistId === 'default') {
    watchlist = await getOrCreateDefaultWatchlist({ address }, c.env.DB)
  } else {
    watchlist = await getWatchlistById(Number(watchlistId), c.env.DB)
  }

  const params = {
    watchlistId: watchlist.id,
    chain,
    itemId,
  }

  await deleteWatchlistItem(params, c.env.DB)
  return c.json({ ok: true })
})

export { app as watchlistItem }
