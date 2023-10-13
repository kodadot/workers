import { Env, Hono } from 'hono'
import { Env as CloudflareEnv } from './utils/constants'
import { subscribe } from './utils/beehiiv'
import { cors } from 'hono/cors'
import { allowedOrigin } from './utils/cors'
import { validator } from 'hono/validator'
import { z } from 'zod'

export interface HonoEnv extends Env {
	Bindings: CloudflareEnv
}

const getResponse = (message: string) => ({ message })

const app = new Hono<HonoEnv>()

app.use('/subscribe', cors({ origin: allowedOrigin }))

app.post('/subscribe',
	validator('json', (value, c) => {
		const schema = z.object({
			email: z.string().email(),
		})

		const parsed = schema.safeParse(value)

		if (!parsed.success) {
			return c.json(getResponse('Invalid email'), 400)
		}

		return value
	})
	, async (c) => {
		const { email } = c.req.valid('json')

		const publicationId = c.env.BEEHIIV_PUBLICATION_ID

		const response = await subscribe({ email, publicationId }, c)

		if (response.status !== 201) {
			return c.json(getResponse('Something went wrong'), 500)
		}

		return c.json({}, 201)
	})

export default app
