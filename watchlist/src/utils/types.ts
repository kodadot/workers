import type { ColumnType } from 'kysely'

export type Generated<T> = T extends ColumnType<infer S, infer I, infer U>
  ? ColumnType<S, I | undefined, U>
  : ColumnType<T, T | undefined, T>

export interface _CfKV {
  key: string
  value: Buffer | null
}

export interface Watchlist {
  id: Generated<number>
  auth_address: string
  chain: string
  entity_id: string
  entity_type: string
  created_at: Generated<string>
  updated_at: Generated<string>
}

export interface DB {
  _cf_KV: _CfKV
  watchlist: Watchlist
}
