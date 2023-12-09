import { Kysely } from 'kysely'
import { D1Dialect } from 'kysely-d1'
import camelcaseKeys from 'camelcase-keys'

type TableName = 'watchlist'

type Database = {
  [K in TableName]: any
}

export interface SearchQuery {
  authAddress: string
  chain: string
  type: string
  id?: string
  limit?: number | string
  offset?: number | string
  sort?: string
}

interface WatchlistItemParams {
  authAddress: string
  chain: string
  type: string
  id: string
}

function createDB(database: D1Database) {
  return new Kysely<Database>({ dialect: new D1Dialect({ database }) })
}

export async function getTotalCount(searchQuery: Omit<SearchQuery, 'limit' | 'offset'>, database: D1Database) {
  const db = createDB(database)

  let query = db
    .selectFrom('watchlist')
    .select(db.fn.countAll().as('count'))
    .where('auth_address', '=', searchQuery.authAddress)
    .where('chain', '=', searchQuery.chain)
    .where('entity_type', '=', searchQuery.type)

  if (searchQuery.id) {
    query = query.where('entity_id', '=', searchQuery.id)
  }

  try {
    const { count } = await query.executeTakeFirstOrThrow()
    return count
  } catch (error) {
    console.error(error)
    return null
  }
}

export async function doSearch(searchQuery: SearchQuery, database: D1Database) {
  const db = createDB(database)

  let query = db
    .selectFrom('watchlist')
    .selectAll()
    .where('auth_address', '=', searchQuery.authAddress)
    .where('chain', '=', searchQuery.chain)
    .where('entity_type', '=', searchQuery.type)

  if (searchQuery.sort === 'createdAt_ASC') {
    query = query.orderBy('created_at', 'asc')
  }
  if (searchQuery.sort === 'createdAt_DESC') {
    query = query.orderBy('created_at', 'desc')
  }

  if (searchQuery.id) {
    query = query.where('entity_id', '=', searchQuery.id)
  }

  if (searchQuery.limit) {
    query = query.limit(Math.min(Number(searchQuery.limit), 25))
  }

  if (searchQuery.offset) {
    query = query.offset(Math.max(Number(searchQuery.offset), 0))
  }

  try {
    const result = await query.execute()
    return camelcaseKeys(result)
  } catch (error) {
    console.error(error)
    return []
  }
}

export async function createWatchlistItem(params: WatchlistItemParams, database: D1Database) {
  const db = createDB(database)

  const query = db.insertInto('watchlist').values({
    auth_address: params.authAddress,
    chain: params.chain,
    entity_type: params.type,
    entity_id: params.id,
  })

  await query.executeTakeFirstOrThrow()
  return { ok: true, error: null }
}

export async function deleteWatchlistItem(params: WatchlistItemParams, database: D1Database) {
  const db = createDB(database)

  const query = db
    .deleteFrom('watchlist')
    .where('auth_address', '=', params.authAddress)
    .where('chain', '=', params.chain)
    .where('entity_type', '=', params.type)
    .where('entity_id', '=', params.id)

  await query.execute()

  return { ok: true, error: null }
}
