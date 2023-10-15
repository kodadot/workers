import { Hono } from 'hono'
import { subscribe } from './utils/beehiiv'
import { HonoEnv } from './utils/types'
import { cors } from 'hono/cors'
import { allowedOrigin } from './utils/cors'
import { subscribeValidator } from './utils/validators'
import { getResponse } from './utils/response'

const app = new Hono<HonoEnv>()

app.use('/subscribe', cors({ origin: allowedOrigin }))

app.post('/subscribe', subscribeValidator, async (c) => {
	const { email } = c.req.valid('json')

	const response = await subscribe(email, c)

	if (response.status !== 201) {
		return c.json(getResponse('Something went wrong'), response.status)
	}

	return c.json(undefined, 204)
})

export default app
