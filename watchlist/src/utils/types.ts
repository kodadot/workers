import type { ColumnType } from 'kysely'

export type Generated<T> = T extends ColumnType<infer S, infer I, infer U>
  ? ColumnType<S, I | undefined, U>
  : ColumnType<T, T | undefined, T>

export interface Watchlist {
  id: Generated<number>
  name: string | null
  address: string
  isDefault: number
  itemsCount: Generated<number>
  createdAt: Generated<string>
  updatedAt: Generated<string>
}

export interface WatchlistItem {
  id: Generated<number>
  chain: string
  type: string
  watchlistId: number
  itemId: string
  createdAt: Generated<string>
  updatedAt: Generated<string>
}

export interface DB {
  watchlist: Watchlist
  watchlistItem: WatchlistItem
}
