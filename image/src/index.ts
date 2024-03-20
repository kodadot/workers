import { Hono } from 'hono'

import { Env } from './utils/constants'
import typeUrlRoute from './routes/type-url'
import typeEndpointRoute from './routes/type-endpoint'
import ipfsRoute from './routes/ipfs'
import metadataRoute from './routes/metadata'
import videoRoute from './routes/video'

const app = new Hono<{ Bindings: Env }>()

app.get('/', (c) => c.text('Hello! cf-workers!'))

app.route('/ipfs', ipfsRoute)
app.route('/type/url', typeUrlRoute) // will be deprecated by /type/endpoint
app.route('/type/endpoint', typeEndpointRoute)
app.route('/metadata', metadataRoute)
app.route('/video', videoRoute)

export default app
