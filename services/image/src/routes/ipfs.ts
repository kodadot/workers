import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { etag } from 'hono/etag'
import { allowedOrigin } from '@kodadot/workers-utils'
import { CACHE_DAY, CACHE_MONTH, Env } from '../utils/constants'
import { fetchIPFS, toIpfsGw } from '../utils/ipfs'
import { getImageByPath, ipfsToCFI } from '../utils/cloudflare-images'
import type { ResponseType } from '../utils/types'

const app = new Hono<{ Bindings: Env }>()

app.use(etag())
app.use('/*', cors({ origin: allowedOrigin }))
app.get('/*', async (c) => {
  const { original } = c.req.query()
  const isOriginal = original === 'true'
  const isHead = c.req.method === 'HEAD'

  const url = new URL(c.req.url)
  const path = url.pathname.replace('/ipfs/', '')
  const fullPath = `${path}${url.search}`

  // Construct the cache key from the cache URL
  const cacheKey = new Request(url.toString() + c.req.method + 'v1', c.req.raw)
  const cache = caches.default
  let response = await cache.match(cacheKey)

  if (response) {
    return new Response(response.body, response)
  }

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
      return fetch(publicUrl, {
        cf: {
          cacheTtlByStatus: {
            '200-299': CACHE_DAY,
            '404': 0,
            '500-599': 0,
          },
        },
      })
    }
  }

  // 2. upload images to cf-images and return it if !isOriginal
  // ----------------------------------------
  console.log('step 2')
  if (!isOriginal && !isHead && mimeType?.includes('image')) {
    const imageUrl = await ipfsToCFI({
      path,
      token: c.env.IMAGE_API_TOKEN,
      imageAccount: c.env.CF_IMAGE_ACCOUNT,
    })

    if (imageUrl) {
      return c.redirect(imageUrl, 301)
    }
  }

  // 3. check existing object on r2
  // ----------------------------------------
  console.log('step 3')
  const renderR2Object = (r2Object: R2ObjectBody, mime?: string) => {
    // add trailing slash for html
    if (mime?.includes('html')) {
      // add trailing slash
      if (!url.pathname.endsWith('/')) {
        return c.redirect(`${url.pathname}/${url.search}`, 301)
      }
    }

    const headers = new Headers()
    r2Object.writeHttpMetadata(headers)

    const statusCode = c.req.raw.headers.get('range') !== null ? 206 : 200

    response = new Response(r2Object.body, {
      headers,
      status: r2Object.body ? statusCode : 304,
    })

    response.headers.append('cache-control', `s-maxage=${CACHE_DAY}`)
    response.headers.append('content-location', url.pathname)
    response.headers.append('date', new Date().toUTCString())
    response.headers.append(
      'expires',
      new Date(Date.now() + CACHE_MONTH * 1000 * 6).toUTCString(), // expires in 6 months
    )
    response.headers.append('vary', 'Accept-Encoding')
    response.headers.append(
      'content-range',
      `bytes 0-${r2Object.size - 1}/${r2Object.size}`,
    )

    c.executionCtx.waitUntil(cache.put(cacheKey, response.clone()))

    return response
  }

  if (object !== null) {
    return renderR2Object(object, mimeType)
  }

  // 4. upload object to r2
  // ----------------------------------------
  console.log('step 4', url.toString())
  const ipfsNftstorage = toIpfsGw(url.toString(), 'nftstorage')
  console.log('ipfsNftstorage', ipfsNftstorage)
  const status = await fetchIPFS({
    path: fullPath,
  })

  const contentLength = status.response?.headers.get('content-length')

  if (status.ok && status.response?.body && status.response?.headers) {
    let body

    if (contentLength === null) {
      body = await status.response?.text()
    } else {
      body = status.response.body as ResponseType
    }

    c.executionCtx.waitUntil(
      c.env.MY_BUCKET.put(objectName, body, {
        httpMetadata: status.response.headers as unknown as Headers,
      }),
    )
  }

  return c.redirect(ipfsNftstorage)
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
