import type { Context } from 'hono'
import type { Env } from '../utils/constants'
import { normalize, contentFrom, type BaseMetadata } from '@kodadot1/hyperdata'
import { ipfsUrl, toNftstorage } from '../utils/ipfs'
import { encodeEndpoint } from './type-url'

type HonoInterface = Context<
  {
    Bindings: Env
  },
  '/metadata',
  {}
>

const getMimeType = async (url: string) => {
  const externalUrl = url.includes('kodadot.xyz') ? toNftstorage(url) : url
  const data = await fetch(externalUrl, { method: 'HEAD' })
  const contentType = data.headers.get('content-type')

  return contentType
}

export const getMetadata = async (c: HonoInterface) => {
  const { url } = c.req.query()
  const key = 'v1.0.0-' + encodeEndpoint(url)

  // ensure ?url=url is present
  if (!url) {
    return c.text('url is required', 400)
  }

  // check on KV
  const metadataKV = await c.env.METADATA.get(key)
  if (metadataKV) {
    return c.json(JSON.parse(metadataKV))
  }

  // 1. put to KV
  // ----------------------------------------
  try {
    const externalUrl = url.includes('kodadot.xyz') ? toNftstorage(url) : url
    const data = await fetch(externalUrl)
    const json = await data.json()
    const content = contentFrom(json as BaseMetadata)
    // @ts-ignore
    const normalized = normalize(content, ipfsUrl)

    const image = normalized.image
    const imageMetadata = await getMimeType(image)

    const animationUrl = normalized.animationUrl
    let animationUrlMetadata
    if (animationUrl) {
      animationUrlMetadata = await getMimeType(animationUrl)
    }

    const predefinedAttributes = {
      image,
      imageMetadata,
      animationUrl,
      animationUrlMetadata,
      thumbnail: normalized.thumbnail,
    }

    const attributes = { ...predefinedAttributes, _raw: normalized }

    c.executionCtx.waitUntil(
      c.env.METADATA.put(key, JSON.stringify(attributes)),
    )

    return c.json(attributes)
  } catch (error) {
    console.log('error', error)
  }

  // 2. fails, redirect to original url
  // ----------------------------------------
  return c.redirect(url, 302)
}
