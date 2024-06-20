import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { allowedOrigin } from '@kodadot/workers-utils'
import { Env } from '../utils/constants'
import { deleteCFI, uploadCFI } from '../utils/cloudflare-images'
import { vValidator } from '@hono/valibot-validator'
import { minLength, object, string, blob, pipe } from 'valibot'

const app = new Hono<{ Bindings: Env }>()

app.use('/*', cors({ origin: allowedOrigin }))

type UploadImage = {
  file: File
  type: string
  address: string
}

const uploadImageRequestSchema = object({
  file: blob('File is required'),
  type: string('Type is required'),
  address: pipe(string(), minLength(42, 'Valid address is required')),
})

app.post('/upload', vValidator('form', uploadImageRequestSchema), async (c) => {
  const { file, type, address } = await c.req.parseBody<UploadImage>()

  const id = `${address}_${type}`

  await deleteCFI({
    id,
    token: c.env.IMAGE_API_TOKEN,
    imageAccount: c.env.CF_IMAGE_ACCOUNT,
  })

  const url = await uploadCFI({
    file,
    id,
    token: c.env.IMAGE_API_TOKEN,
    imageAccount: c.env.CF_IMAGE_ACCOUNT,
  })

  return c.json({ url })
})

export default app
