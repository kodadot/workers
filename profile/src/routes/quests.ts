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

// Notes: 
// refactor /types/:type, into query param

app.use('/', cors({ origin: allowedOrigin }))

app.get('/', async (c) => {
  const { type } = c.req.query()
  const result = await findAllByKey('type', type, 'quests', c.env.PROFILE_DB)
  return c.json(result)
})

app.use('/users/:account', cors({ origin: allowedOrigin }))

app.get('/users/:account', async (c) => {
  const id = c.req.param('account')
  const address = addressOf(id)
  const result = await findAllByKey('account_id', address, 'completed_quests', c.env.PROFILE_DB)
  return c.json(result)
})

// Finish a quest
app.use('/:id/users/:account', cors({ origin: allowedOrigin }))

// DEV: Protected by signature? OR auth.
app.post('/:id/users/:account', async (c) => {
  const id = c.req.param('id')
  const account = c.req.param('account')
  const address = addressOf(account)
  const value = { quest_id: id, account_id: address }
  const res = await save(value, 'completed_quests', c.env.PROFILE_DB)
  return c.json(res)
})


// DEV: This is protected route
app.put('/:id/users/:account/pay/:tx', async (c) => {
  const id = c.req.param('id')
  const account = c.req.param('account')
  const address = addressOf(account)
  const paid = c.req.param('tx')
  const db = dbOf(c.env.PROFILE_DB);
  const res = await db.updateTable('completed_quests').set({ paid })
  .where('account_id', '=', address)
  .where('quest_id', '=', id)
  .executeTakeFirst()
  return c.json(res)
  
})




export { app as quests }
