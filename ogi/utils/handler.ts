import type { Prefix } from '@kodadot1/static'
import type { Collection, BaseItem, NFT, DropItem } from '@/utils/types'
import { getClient, extendFields } from '@kodadot1/uniquery'

export const prefixChain = (prefix: Prefix) => {
  const token: { [key: string]: string } = {
    ahk: 'kusama',
    ahp: 'polkadot',
    ksm: 'kusama',
    rmrk: 'kusama',
    bsx: 'kusama',
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
  const drop = await fetch(`https://waifu-me.kodadot.workers.dev/drops/${id}`)
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

const encodeEndpoint = (endpoint: string) => {
  return endpoint.replace(/[:,._/]/g, '-')
}

export const parseImage = async (imagePath: string) => {
  const rawImage = `https://raw.githubusercontent.com/kodadot/nft-gallery/main/public${imagePath}`
  const encodeImage = encodeEndpoint(rawImage)

  // upload image to our cf-images
  // throw an error on satori if using original size image
  await fetch(`https://image-beta.w.kodadot.xyz/type/url?endpoint=${rawImage}`)

  // then, get the small image
  return `https://imagedelivery.net/jk5b6spi_m_-9qC4VTnjpg/${encodeImage}/small`
}
