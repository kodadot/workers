import { Env, Hono } from 'hono'
import { cors } from 'hono/cors'

import { addressOf } from '../utils/accounts'
import { Env as CloudflareEnv } from '../utils/constants'
import { allowedOrigin } from '../utils/cors'
import { findById, save } from '../utils/db'
import { SignatureRequest, isSignatureValid } from '../utils/external'

interface HonoEnv extends Env {
  Bindings: CloudflareEnv
}

const app = new Hono<HonoEnv>();

app.use('/:id', cors({ origin: allowedOrigin }))

app.get('/:id', async (c) => {
  const id = c.req.param('id')
  const address = addressOf(id)
  const result = await findById(address, 'accounts', c.env.PROFILE_DB)
  return c.json(result)
})

app.on(['PUT', 'POST'], '/:id', async (c) => {
  const id = c.req.param('id')
  const address = addressOf(id)
  const result = await findById(address, 'accounts', c.env.PROFILE_DB)
  const body = await c.req.json<SignatureRequest>()

  const verified = await isSignatureValid(body)

  if (!verified) {
    throw new Error('Cannot verify the signature')
  }

  const update = JSON.parse(body.message)

  const entity = !result ? { id, ...update } : { ...result, update }
  const res = await save(entity, 'accounts', c.env.PROFILE_DB)
  
  return c.json(res)
})

export { app as profiles }
