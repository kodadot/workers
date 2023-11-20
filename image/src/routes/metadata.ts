import type { Context } from 'hono'
import type { Env } from '../utils/constants'
import { normalize, contentFrom, type BaseMetadata } from '@kodadot1/hyperdata'
import { getProviderList } from '@kodadot1/minipfs'
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

const toCustomKodaURL = (url: string) => {
  if (!url) {
    return ''
  }

  const kodaUrl = new URL(getProviderList(['kodadot_beta'])[0])
  kodaUrl.pathname = '/type/url'
  kodaUrl.searchParams.set('endpoint', url)

  return kodaUrl.toString()
}

export const getMetadata = async (c: HonoInterface) => {
  const { url } = c.req.query()
  const key = 'v1.0.0-' + encodeEndpoint(url)

  // ensure ?url=url is present
  if (!url) {
    return c.text('url is required', 400)
  }

  try {
    // check on KV
    const metadataKV = await c.env.METADATA.get(key)
    if (metadataKV) {
      return c.json(JSON.parse(metadataKV))
    }

    // 1. put to KV
    // ----------------------------------------
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
      // TODO: get video thumbnail once we implemented CF-Streams
      // https://image-beta.w.kodadot.xyz/ipfs/bafkreia3j75r474kgxxmptwh5n43j5nrvn3du5l7dcfq2twh73wmagqs6m
      thumbnail: normalized.thumbnail,
    }

    if (!image.includes('w.kodadot.xyz')) {
      predefinedAttributes.image = toCustomKodaURL(image)
    }

    if (!animationUrl.includes('w.kodadot.xyz')) {
      predefinedAttributes.animationUrl = toCustomKodaURL(animationUrl)
    }

    const attributes = { ...predefinedAttributes, _raw: normalized }

    c.executionCtx.waitUntil(
      c.env.METADATA.put(key, JSON.stringify(attributes))
    )

    return c.json(attributes)
  } catch (error) {
    console.log('invalid metadata json', error)
  }

  // 2. fails, redirect to original url
  // ----------------------------------------
  return c.redirect(url)
}
