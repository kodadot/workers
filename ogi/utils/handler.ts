import type { Prefix } from '@kodadot1/static'
import type { Collection, BaseItem, NFT, DropItem } from '@/utils/types'
import { encodeEndpoint } from '@kodadot/workers-utils'
import { getClient, extendFields } from '@kodadot1/uniquery'

export const prefixChain = (prefix: Prefix) => {
  const token: { [key: string]: string } = {
    ahk: 'kusama',
    ahp: 'polkadot',
    ksm: 'kusama',
    rmrk: 'kusama',
    base: 'ethereum',
  }

  return token[prefix]
}

export const usdPrice = async (prefix: Prefix, amount: string) => {
  const id = prefixChain(prefix)
  const getUsd = await fetch(`https://price.kodadot.workers.dev/price/${id}`)
  const usd = await getUsd.json()
  const price = parseFloat(amount) * usd[id].usd

  return price.toFixed(2)
}

export const getDropById = async (id: string) => {
  const drop = await fetch(`https://fxart.kodadot.workers.dev/drops/${id}`)
  return (await drop.json()) as DropItem
}

export const getCollectionById = async (prefix: Prefix, id: string) => {
  const client = getClient(prefix)
  const query = client.collectionById(id, extendFields(['meta', 'max']))

  return (await client.fetch(query)) as unknown as Promise<{
    data: {
      collection: Collection
    }
  }>
}

export const getItemListByCollectionId = async (prefix: Prefix, id: string) => {
  const client = getClient(prefix)
  const query = client.itemListByCollectionId(id)

  return (await client.fetch(query)) as unknown as Promise<{
    data: {
      items: BaseItem[]
    }
  }>
}

export const getItemCountByCollectionId = async (chain: Prefix, id: string) => {
  const client = getClient(chain)
  const query = client.itemCountByCollectionId(id)

  return await client.fetch(query)
}

export const getNftById = async (prefix: Prefix, id: string) => {
  const client = getClient(prefix)
  const query = client.itemById(id, extendFields(['meta', 'price']))

  return (await client.fetch(query)) as unknown as Promise<{
    data: {
      item: NFT
    }
  }>
}

export const getMarkdown = async (slug: string) => {
  const res = await fetch(
    `https://raw.githubusercontent.com/kodadot/nft-gallery/main/content/blog/${slug}.md`,
  )
  const text = await res.text()

  return text
}

export const parseImage = async (imagePath: string, github = true) => {
  const rawImage = github
    ? `https://raw.githubusercontent.com/kodadot/nft-gallery/main/public${imagePath}`
    : imagePath

  const image = new URL(
    `https://image-beta.w.kodadot.xyz/type/endpoint/${rawImage}`,
  )
  // use smaller image here
  // because there is a chance satori will throw error if using original size image
  image.searchParams.set('w', '400')
  const response = await $fetch.raw(image.toString(), {
    redirect: 'manual',
  })
  const location = response.headers.get('location')
  
  return location || image.toString()
}
