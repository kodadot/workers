import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { Env } from '../utils/constants'
import {
  downloadStream,
  searchStream,
  uploadStream,
} from '../utils/cloudflare-stream'
import { allowedOrigin } from '../utils/cors'

const app = new Hono<{ Bindings: Env }>()

app.use('/*', cors({ origin: allowedOrigin }))
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

app.post('/download', async (c) => {
  const { videoUrl } = await c.req.json()

  const exist = await searchStream({
    account: c.env.CF_IMAGE_ACCOUNT,
    token: c.env.IMAGE_API_TOKEN,
    videoUrl,
  })

  if (exist.uid) {
    const download = await downloadStream({
      account: c.env.CF_IMAGE_ACCOUNT,
      token: c.env.IMAGE_API_TOKEN,
      videoUid: exist.uid,
    })

    return c.json({
      url: videoUrl,
      uid: exist.uid,
      detail: exist,
      video: download,
    })
  }

  const upload = await uploadStream({
    account: c.env.CF_IMAGE_ACCOUNT,
    token: c.env.IMAGE_API_TOKEN,
    videoUrl,
  })

  return c.json({
    url: videoUrl,
    uid: '',
    video: upload,
  })
})

app.options('/download', async (c) => {
  c.res.headers.set('Access-Control-Allow-Origin', '*')
  c.res.headers.set('Access-Control-Allow-Methods', 'POST, OPTIONS')
  c.res.headers.set(
    'Access-Control-Allow-Headers',
    'Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With'
  )
  c.res.headers.set('Access-Control-Max-Age', '86400')
  c.res.headers.set('Access-Control-Allow-Credentials', 'true')

  return c.text('')
})

export default app
