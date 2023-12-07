import { Hono } from 'hono'

import { Env } from './utils/constants'
import typeUrlRoute from './routes/type-url'
import ipfsRoute from './routes/ipfs'

const app = new Hono<{ Bindings: Env }>()

app.get('/', (c) => c.text('Hello! cf-workers!'))

app.route('/ipfs', ipfsRoute)
app.route('/type/url', typeUrlRoute)

export default app
