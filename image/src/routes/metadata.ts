import { Hono } from 'hono'
import type { Env } from '../utils/constants'
import { normalize, contentFrom, type BaseMetadata } from '@kodadot1/hyperdata'
import { ipfsUrl, toIPFSDedicated } from '../utils/ipfs'
import { encodeEndpoint } from './type-endpoint'
import { cors } from 'hono/cors'
import { allowedOrigin } from '../utils/cors'

const app = new Hono<{ Bindings: Env }>()

// unable to call same workers
const toExternalGateway = (url: string) => {
  const KODA_WORKERS = 'w.kodadot.xyz/ipfs/'

  return url.includes(KODA_WORKERS) ? toIPFSDedicated(url) : url
}

const getMimeType = async (url: string): Promise<string> => {
  if (!url) {
    return ''
  }

  const externalUrl = toExternalGateway(url)
  const data = await fetch(externalUrl, { method: 'HEAD' })
  const contentType = data.headers.get('content-type')

  if (data.status !== 200) {
    return await getMimeType(url)
  }

  return contentType ?? ''
}

app.use('/*', cors({ origin: allowedOrigin }))

const VERSION_KEY = 'v1.0.1'

app.get('/*', async (c) => {
  const { url } = c.req.query()
  const key = VERSION_KEY + encodeEndpoint(url)

  // ensure ?url=url is present
  if (!url) {
    return c.text('url is required', 400)
  }

  try {
    // 1. check on KV. if exists, return the data
    // ----------------------------------------
    const metadataKV = await c.env.METADATA.get(key)
    if (metadataKV) {
      return c.json(JSON.parse(metadataKV))
    }

    // TODO: additional layer, check metadata on R2 bucket

    // 2. put to KV
    // ----------------------------------------
    const externalUrl = toExternalGateway(url)
    const data = await fetch(externalUrl)
    console.log('fetch metadata status', externalUrl, data.status)

    if (!data.ok) {
      return c.redirect(url)
    }

    const json = await data.json<BaseMetadata>()
    const content = contentFrom(json, true)
    // @ts-ignore
    const normalized = normalize(content, ipfsUrl)

    const imageMimeType = await getMimeType(normalized.image)
    const animationUrlMimeType = await getMimeType(normalized.animationUrl)

    const attributes = {
      imageMimeType,
      animationUrlMimeType,
      ...normalized,
    }

    // TODO: get video thumbnail once we implemented CF-Streams #186
    // https://image-beta.w.kodadot.xyz/ipfs/bafkreia3j75r474kgxxmptwh5n43j5nrvn3du5l7dcfq2twh73wmagqs6m
    // if (attributes.animationUrlMimeType.includes('video')) {}

    // cache it on KV
    c.executionCtx.waitUntil(
      c.env.METADATA.put(key, JSON.stringify(attributes))
    )

    return c.json(attributes)
  } catch (error) {
    console.log('invalid metadata json', error)
  }

  // 3. fails, redirect to original url
  // ----------------------------------------
  return c.redirect(url)
})

app.delete('/*', async (c) => {
  const { url } = c.req.query()
  const key = VERSION_KEY + encodeEndpoint(url)

  try {
    await c.env.METADATA.delete(key)

    return c.json({ status: 'ok' })
  } catch (error) {
    return c.json({ status: 'error', error }, 500)
  }
})

export default app
