import { Hono } from 'hono'
import { HonoEnv } from '../utils/constants'
import { authAddressValidator, itemSearchParamsValidator } from '../utils/validator'
import { createWatchlistItem, deleteWatchlistItem, doSearch } from '../utils/db'

const app = new Hono<HonoEnv>()

app.get('/', authAddressValidator(), itemSearchParamsValidator(), async (c) => {
  const { chain, type, id } = c.req.valid('param')
  const { limit, offset } = c.req.query()
  const authAddress = c.req.valid('header')['x-auth-address']

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

app.post('/', authAddressValidator(), itemSearchParamsValidator(), async (c) => {
  const { chain, type, id } = c.req.valid('param')
  const authAddress = c.req.valid('header')['x-auth-address']

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

app.delete('/', authAddressValidator(), itemSearchParamsValidator(), async (c) => {
  const { chain, type, id } = c.req.valid('param')
  const authAddress = c.req.valid('header')['x-auth-address']

  const body = {
    authAddress,
    chain,
    type,
    id,
  }
  const info = await deleteWatchlistItem(body, c.env.DB)

  return c.json(info)
})

export { app as watchlistItem }
