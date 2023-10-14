
import { validator } from 'hono/validator'
import { getResponse } from './response'
import { z } from 'zod'

const subscribeSchema = z.object({
    email: z.string().email(),
})

export const subscribeValidator = validator('json', (value, c) => {
    const parsed = subscribeSchema.safeParse(value)

    if (!parsed.success) {
        return c.json(getResponse('Invalid email'), 400)
    }

    return value
})