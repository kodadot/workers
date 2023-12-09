import { Hono } from 'hono'
import { HonoEnv } from '../utils/constants'
import { authAddressValidator, listSearchParamsValidator } from '../utils/validator'
import { doSearch, getTotalCount } from '../utils/db'

const app = new Hono<HonoEnv>()

app.get('/', authAddressValidator(), listSearchParamsValidator(), async (c) => {
  const { chain, type } = c.req.valid('param')
  const { limit, offset, sort } = c.req.query()
  const authAddress = c.req.valid('header')['x-auth-address']

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

export { app as watchlist }
