import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { allowedOrigin } from '@kodadot/workers-utils'
import { Env } from '../utils/constants'
import { uploadCFI } from '../utils/cloudflare-images'
import { vValidator } from '@hono/valibot-validator'
import {
  UploadImage,
  uploadImageRequestSchema,
} from '../schemas/uploadImageRequestSchema'

const app = new Hono<{ Bindings: Env }>()

app.use('/*', cors({ origin: allowedOrigin }))

app.post('/upload', vValidator('form', uploadImageRequestSchema), async (c) => {
  const { file } = await c.req.parseBody<UploadImage>()

  const url = await uploadCFI({
    file,
    token: c.env.IMAGE_API_TOKEN,
    imageAccount: c.env.CF_IMAGE_ACCOUNT,
    id: `${crypto.randomUUID()}_${file.name}`,
  })

  return c.json({ url })
})

export default app
