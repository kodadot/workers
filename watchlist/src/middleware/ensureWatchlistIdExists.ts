import { MiddlewareHandler } from 'hono'
import { HonoEnv } from '../utils/constants'
import { getWatchlistById } from '../utils/db'

export function ensureWatchlistIdExists(): MiddlewareHandler<HonoEnv, '/:watchlistId'> {
  return async (c, next) => {
    const { watchlistId } = c.req.param()

    if (watchlistId === 'default' && Number.isNaN(Number(watchlistId))) {
      return next()
    }

    const validatedAddress = c.get('validatedAddress')
    try {
      const watchlist = await getWatchlistById(Number(watchlistId), c.env.DB)
      if (watchlist.address !== validatedAddress) {
        return c.json({ error: 'watchlist not found' }, 404)
      }
    } catch (error) {
      console.error(error)
      return c.json({ error: 'watchlist not found' }, 404)
    }

    return next()
  }
}
