import type { Prefix } from '@kodadot1/static'

export interface BaseItem {
  id: string
  createdAt: string
  name: string
  metadata: string
  currentOwner: string
  issuer: string
}

export interface BaseItemMeta {
  id: string
  name: string
  description: string
  image: string
  animationUrl: string | null
  type: string | null
}

export interface Collection extends BaseItem {
  meta: BaseItemMeta
}

export interface NFT extends BaseItem {
  meta: BaseItemMeta
  price: string
}

export type DropItem = {
  id: string
  chain: Prefix
  collection: string
  image: string
  name: string
  alias: string
  type: string
  meta: string
  disabled: number
}
