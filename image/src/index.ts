import { Hono } from 'hono'
import { cors } from 'hono/cors'

import { Env } from './utils/constants'
import { allowedOrigin } from './utils/cors'
import { getTypeUrl } from './routes/type-url'
import ipfsRoute from './routes/ipfs'

const app = new Hono<{ Bindings: Env }>()

app.get('/', (c) => c.text('Hello! cf-workers!'))

app.route('/ipfs', ipfsRoute)

app.use('/type/url', cors({ origin: allowedOrigin }))
app.on(['GET', 'HEAD'], '/type/url', getTypeUrl)

export default app
