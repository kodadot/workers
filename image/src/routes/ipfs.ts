import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { CACHE_DAY, Env } from '../utils/constants'
import { fetchIPFS } from '../utils/ipfs'
import { getImageByPath, ipfsToCFI } from '../utils/cloudflare-images'
import { allowedOrigin } from '../utils/cors'
import type { ResponseType } from '../utils/types'

const app = new Hono<{ Bindings: Env }>()

app.use('/*', cors({ origin: allowedOrigin }))
app.get('/*', async (c) => {
  const { original } = c.req.query()
  const isOriginal = original === 'true'
  const isHead = c.req.method === 'HEAD'

  const url = new URL(c.req.url)
  const path = url.pathname.replace('/ipfs/', '')
  const fullPath = `${path}${url.search}`

  // TODO: check response from cache
  // related issue: TypeError: Can't modify immutable headers.
  // ----------------------------------------
  let response = undefined
  console.log('response', response)

  // contruct r2 object
  const objectName = `ipfs/${path}`
  const object = await c.env.MY_BUCKET.get(objectName)
  // TODO: check which one is faster to get mimeType from r2 or kv (probably kv, because only store mimeType string on kv)
  const mimeType = object?.httpMetadata?.contentType
  console.log('object', object)
  console.log('mime type', mimeType)

  // 1. check existing image on cf-images && !isOriginal
  // ----------------------------------------
  console.log('step 1')
  if (mimeType?.includes('image') && !isOriginal && !isHead) {
    const publicUrl = await getImageByPath({
      token: c.env.IMAGE_API_TOKEN,
      imageAccount: c.env.CF_IMAGE_ACCOUNT,
      path: fullPath,
    })

    if (publicUrl) {
      return c.redirect(publicUrl)
    }
  }

  // 2. check object from r2
  // ----------------------------------------
  console.log('step 2')
  const renderR2Object = (r2Object: R2ObjectBody, mime?: string) => {
    // add trailing slash for html
    if (mime?.includes('html')) {
      // add trailing slash
      if (!url.pathname.endsWith('/')) {
        return c.redirect(`${url.pathname}/${url.search}`)
      }
    }

    const headers = new Headers()
    r2Object.writeHttpMetadata(headers)
    headers.set('etag', r2Object.httpEtag)

    const statusCode = c.req.raw.headers.get('range') !== null ? 206 : 200

    response = new Response(r2Object.body, {
      headers,
      status: r2Object.body ? statusCode : 304,
    })

    response.headers.append('cache-control', `s-maxage=${CACHE_DAY}`)
    response.headers.append(
      'content-range',
      `bytes 0-${r2Object.size - 1}/${r2Object.size}`
    )

    return response
  }

  if (object !== null) {
    return renderR2Object(object, mimeType)
  }

  // 3. upload object to r2
  // ----------------------------------------
  console.log('step 3')
  if (object === null) {
    const status = await fetchIPFS({
      path: fullPath,
      gateway1: c.env.DEDICATED_GATEWAY,
      gateway2: c.env.DEDICATED_BACKUP_GATEWAY,
    })

    const contentLength = status.response?.headers.get('content-length')

    if (status.ok && status.response?.body && status.response?.headers) {
      let body

      if (contentLength === null) {
        body = await status.response?.text()
      } else {
        body = status.response.body as ResponseType
      }

      await c.env.MY_BUCKET.put(objectName, body, {
        httpMetadata: status.response.headers,
      })
    }
  }

  // 4. upload images to cf-images and return it if !isOriginal
  // ----------------------------------------
  console.log('step 4')
  const imageUrl = await ipfsToCFI({
    path,
    token: c.env.IMAGE_API_TOKEN,
    gateway: c.env.DEDICATED_GATEWAY,
    imageAccount: c.env.CF_IMAGE_ACCOUNT,
  })

  if (imageUrl && !isOriginal && !isHead) {
    return c.redirect(imageUrl)
  }

  // 5. return object from r2
  // ----------------------------------------
  console.log('step 5')
  const newObject = await c.env.MY_BUCKET.get(objectName)

  if (newObject !== null) {
    return renderR2Object(newObject, newObject?.httpMetadata?.contentType)
  }
})

app.delete('/*', async (c) => {
  const url = new URL(c.req.url)
  const path = url.pathname.replace('/ipfs/', '')
  const objectName = `ipfs/${path}`

  try {
    await c.env.MY_BUCKET.delete(objectName)

    return c.json({ status: 'ok' })
  } catch (error) {
    return c.json({ status: 'error', error }, 500)
  }
})

export default app
