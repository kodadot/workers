import { Hono } from 'hono'
import { Env } from '../utils/constants'
import { searchStream, uploadStream } from '../utils/cloudflare-stream'

const app = new Hono<{ Bindings: Env }>()

app.post('/', async (c) => {
  const { videoUrl } = await c.req.json()

  const exist = await searchStream({
    account: c.env.CF_IMAGE_ACCOUNT,
    token: c.env.IMAGE_API_TOKEN,
    videoUrl,
  })

  if (exist) {
    return c.json({
      url: videoUrl,
      exist: true,
      video: exist,
    })
  }

  const upload = await uploadStream({
    account: c.env.CF_IMAGE_ACCOUNT,
    token: c.env.IMAGE_API_TOKEN,
    videoUrl,
  })

  return c.json({
    url: videoUrl,
    video: upload,
  })
})

export default app
