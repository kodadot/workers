import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { createWatchlistItem, deleteWatchlistItem, doSearch, getTotalCount } from './utils/db'
import { authAddressValidator, itemSearchParamsValidator, listSearchParamsValidator } from './utils/validator'
import { allowedOrigin } from './utils/cors'
import { HonoEnv } from './utils/constants'

const app = new Hono<HonoEnv>()

app.use('*', cors({ origin: allowedOrigin }))

app.get('/', async (ctx) => {
  return ctx.text('KODADOT WATCHLIST SERVICE - https://kodadot.xyz')
})

app.get('/:chain/:type', authAddressValidator(), listSearchParamsValidator(), async (c) => {
  const { chain, type } = c.req.valid('param')
  const { limit, offset, sort } = c.req.query()
  const authAddress = c.req.valid('header')['x-auth-address']

  if (!chain || !type) {
    return c.json({ error: 'chain, type, id are required' }, 400)
  }

  const searchQuery = {
    authAddress,
    chain,
    type,
    limit,
    offset,
    sort,
  }
  const [data, total] = await Promise.all([doSearch(searchQuery, c.env.DB), getTotalCount(searchQuery, c.env.DB)])

  return c.json({ data, total })
})

app.get('/:chain/:type/:id', authAddressValidator(), itemSearchParamsValidator(), async (c) => {
  const { chain, type, id } = c.req.valid('param')
  const { limit, offset } = c.req.query()
  const authAddress = c.req.valid('header')['x-auth-address']

  if (!chain || !type || !id) {
    return c.json({ error: 'chain, type, id are required' }, 400)
  }

  const searchQuery = {
    authAddress,
    chain,
    type,
    id,
    limit,
    offset,
  }
  const [result] = await doSearch(searchQuery, c.env.DB)

  return c.json({ data: result || null })
})

app.post('/:chain/:type/:id', authAddressValidator(), itemSearchParamsValidator(), async (c) => {
  const { chain, type, id } = c.req.valid('param')
  const authAddress = c.req.valid('header')['x-auth-address']

  if (!chain || !type || !id) {
    return c.json({ error: 'chain, type, id are required' }, 400)
  }

  const body = {
    authAddress,
    chain,
    type,
    id,
  }

  const existedResult = await doSearch({ ...body, limit: 1, offset: 0 }, c.env.DB)

  if (existedResult.length) {
    return c.json({ error: 'item already exists' }, 409)
  }

  const info = await createWatchlistItem(body, c.env.DB)

  return c.json(info)
})

app.delete('/:chain/:type/:id', authAddressValidator(), itemSearchParamsValidator(), async (c) => {
  const { chain, type, id } = c.req.valid('param')
  const authAddress = c.req.valid('header')['x-auth-address']

  if (!chain || !type || !id) {
    return c.json({ error: 'chain, type, id are required' }, 400)
  }

  const body = {
    authAddress,
    chain,
    type,
    id,
  }
  const info = await deleteWatchlistItem(body, c.env.DB)

  return c.json(info)
})

app.onError((err, c) => {
  console.error(`${err}`)
  return c.json({ error: err.message, path: c.req.url }, 400)
})

export default app
