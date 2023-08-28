import { Env, Hono } from 'hono'
import { cors } from 'hono/cors'

import { addressOf } from '../utils/accounts'
import { Env as CloudflareEnv } from '../utils/constants'
import { allowedOrigin } from '../utils/cors'
import { dbOf, findAllByKey, findById, save, selectAll } from '../utils/db'
import { SignatureRequest, isSignatureValid } from '../utils/external'

interface HonoEnv extends Env {
  Bindings: CloudflareEnv
}

const app = new Hono<HonoEnv>();

app.use('/', cors({ origin: allowedOrigin }))

app.get('/', async (c) => {
  const { type } = c.req.query()
  if (!type) {
    return c.text('type is required', 400)
  }
  const result = await findAllByKey('type', type, 'quests', c.env.PROFILE_DB)
  return c.json(result)
})