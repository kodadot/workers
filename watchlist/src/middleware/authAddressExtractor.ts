import { MiddlewareHandler } from 'hono'
import { isValidAddress, toSS58 } from '../utils/address'
import { HonoEnv } from '../utils/constants'

export function authAddressExtractor(): MiddlewareHandler<HonoEnv> {
  return async (c, next) => {
    const rawAddress = c.req.header('x-auth-address')

    if (!rawAddress || !isValidAddress(rawAddress)) {
      return c.json({ error: 'invalid auth address' }, 400)
    }

    c.set('validatedAddress', toSS58(rawAddress))
    await next()
  }
}
