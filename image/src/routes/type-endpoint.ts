import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { CACHE_TTL_BY_STATUS, type Env } from '../utils/constants'
import { urlToCFI } from '../utils/cloudflare-images'
import { allowedOrigin } from '../utils/cors'
import { ResponseType } from '../utils/types'
import { ipfsUrl } from '../utils/ipfs'

const app = new Hono<{ Bindings: Env }>()

export const encodeEndpoint = (endpoint: string) => {
  return endpoint.replace(/[:,._/]/g, '-')
}



const writeMimeTypeToResponse = async (
  R2Object: R2ObjectBody,
): Promise<ReadableStream> => {
  const decoder = new TextDecoder('utf-8')
  const encoder = new TextEncoder()
  const bodyStream = R2Object.body
  let dataBytes = new Uint8Array() // Array to store bytes

  for await (const chunk of bodyStream) {
    dataBytes = new Uint8Array([...dataBytes, ...chunk]) // Concatenate chunks
  }

  const decodedString = decoder.decode(dataBytes)

  const ipfsData = JSON.parse(decodedString).image

  const ipfs1 = await ipfsUrl(ipfsData)

  const getMimeType = await import('../utils/get-mime-type').then((module) => module.getMimeType)
  const mime = await getMimeType(ipfs1 , 'typeEndpoint')

  let finalResponse = JSON.parse(decodedString)
  finalResponse.imageMimeType = mime
  finalResponse = JSON.stringify(finalResponse)

  const encodedData = encoder.encode(finalResponse)

  // Create a custom ReadableStream
  const stream = new ReadableStream({
    start(controller) {
      controller.enqueue(encodedData)
      controller.close()
    },
  })

  return stream
}

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
  const cfImage = `https://imagedelivery.net/${c.env.CF_IMAGE_ID}/${path}/public`
  const currentImage = await fetch(cfImage, {
    method: 'HEAD',
    cf: CACHE_TTL_BY_STATUS,
  })

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

    const modifiedResponse = await writeMimeTypeToResponse(object)
    return new Response(modifiedResponse, {
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
      httpMetadata: fetchObject.headers,
    })

    const newObject = await c.env.MY_BUCKET.get(objectName)

    if (newObject !== null) {
      const headers = new Headers()
      newObject.writeHttpMetadata(headers)
      headers.set('Access-Control-Allow-Origin', '*')
      headers.set('etag', newObject.httpEtag)

      const modifiedResponse = await writeMimeTypeToResponse(newObject)
      return new Response(modifiedResponse, {
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

  try {
    await c.env.MY_BUCKET.delete(objectName)

    return c.json({ status: 'ok' })
  } catch (error) {
    return c.json({ status: 'error', error }, 500)
  }
})

export default app
