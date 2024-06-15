import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { allowedOrigin } from '@kodadot/workers-utils'
import { Env } from '../utils/constants'
import { getImageByPath, uploadCFI } from '../utils/cloudflare-images'
import { vValidator } from '@hono/valibot-validator'
import Hash from 'ipfs-only-hash'
import { blob, object } from 'valibot'

const app = new Hono<{ Bindings: Env }>()

app.use('/*', cors({ origin: allowedOrigin }))

type UploadImage = {
  file: File
}

const uploadImageRequestSchema = object({
  file: blob('File is required'),
})

app.post('/upload', vValidator('form', uploadImageRequestSchema), async (c) => {
  const { file } = await c.req.parseBody<UploadImage>()

  const path = await Hash.of(new Uint8Array(await file.arrayBuffer()))

  let url = await getImageByPath({
    token: c.env.IMAGE_API_TOKEN,
    imageAccount: c.env.CF_IMAGE_ACCOUNT,
    path,
  })

  if (!url) {
    url =
      (await uploadCFI({
        file,
        token: c.env.IMAGE_API_TOKEN,
        imageAccount: c.env.CF_IMAGE_ACCOUNT,
        id: path,
      })) ?? ''
  }

  return c.json({ url })
})

export default app
