import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { allowedOrigin, encodeEndpoint } from '@kodadot/workers-utils'
import { CACHE_TTL_BY_STATUS, type Env } from '../utils/constants'
import { getCFIFlexibleVariant, urlToCFI } from '../utils/cloudflare-images'
import { ResponseType } from '../utils/types'

const app = new Hono<{ Bindings: Env }>()

app.use('/*', cors({ origin: allowedOrigin }))

app.get('/*', async (c) => {
  const endpoint = new URL(c.req.url.split('/endpoint/')[1]).toString()
  const path = encodeEndpoint(endpoint)
  const isHead = c.req.method === 'HEAD'

  if (!endpoint) {
    return c.text('Invalid endpoint', 400)
  }

  // 1. check existing image on cf-images
  // ----------------------------------------
  let cfImage = `https://imagedelivery.net/${c.env.CF_IMAGE_ID}/${path}/public`
  cfImage = getCFIFlexibleVariant(c.req.query(), cfImage)
  const currentImage = await fetch(cfImage)

  if (currentImage.ok && !isHead) {
    return c.redirect(cfImage, 302)
  }

  // 2. check existing object in r2 bucket
  // ----------------------------------------
  const objectName = `type-endpoint/${path}`
  const object = await c.env.MY_BUCKET.get(objectName)

  if (object !== null) {
    const headers = new Headers()
    object.writeHttpMetadata(headers)
    headers.set('Access-Control-Allow-Origin', '*')
    headers.set('etag', object.httpEtag)

    return new Response(object.body, {
      headers,
    })
  }

  // 3. upload image to cf-images
  // ----------------------------------------
  const imageUrl = await urlToCFI({
    endpoint,
    token: c.env.IMAGE_API_TOKEN,
    imageAccount: c.env.CF_IMAGE_ACCOUNT,
  })

  if (imageUrl && !isHead) {
    return c.redirect(imageUrl, 302)
  }

  // 4. upload to r2 bucket
  // ----------------------------------------
  const fetchObject = await fetch(endpoint, {
    cf: CACHE_TTL_BY_STATUS,
  })
  const statusCode = fetchObject.status

  if (statusCode === 200) {
    let body
    if (fetchObject.headers.get('content-length') == null) {
      body = await fetchObject.text()
    } else {
      body = fetchObject.body
    }
    await c.env.MY_BUCKET.put(objectName, body as ResponseType, {
      httpMetadata: fetchObject.headers as unknown as Headers,
    })

    const newObject = await c.env.MY_BUCKET.get(objectName)

    if (newObject !== null) {
      const headers = new Headers()
      newObject.writeHttpMetadata(headers)
      headers.set('Access-Control-Allow-Origin', '*')
      headers.set('etag', newObject.httpEtag)

      return new Response(newObject.body, {
        headers,
      })
    }
  }

  // 5. if all else fails, redirect to original endpoint
  // ----------------------------------------
  return c.redirect(endpoint, 302)
})

app.delete('/*', async (c) => {
  const endpoint = new URL(c.req.url.split('/endpoint/')[1]).toString()
  const path = encodeEndpoint(endpoint)
  const objectName = `type-endpoint/${path}`

  console.log({ objectName })

  try {
    await c.env.MY_BUCKET.delete(objectName)

    return c.json({ status: 'ok' })
  } catch (error) {
    return c.json({ status: 'error', error }, 500)
  }
})

export default app
