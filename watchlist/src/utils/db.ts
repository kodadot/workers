import { CamelCasePlugin, Kysely, sql } from 'kysely'
import { D1Dialect } from 'kysely-d1'
import { DB } from './types'

interface WatchlistSearchParams {
  address: string
  isDefault?: 0 | 1
}

interface WatchlistCreateParams {
  address: string
  name?: string
  isDefault?: 0 | 1
}

interface WatchlistItemCreateParams {
  chain: string
  type: string
  watchlistId: number
  itemId: string
}

export interface WatchlistItemsSearchQuery {
  chain: string
  type?: string
  watchlistId: number
  itemId?: string
  limit?: number | string
  offset?: number | string
  sort?: string
}

function createDB(database: D1Database) {
  return new Kysely<DB>({ dialect: new D1Dialect({ database }), plugins: [new CamelCasePlugin()] })
}

export async function searchWatchlist(params: WatchlistSearchParams, database: D1Database) {
  const db = createDB(database)

  let query = db.selectFrom('watchlist').selectAll().where('address', '=', params.address)

  if (params.isDefault !== undefined) {
    query.where('isDefault', '=', params.isDefault)
  }

  const result = await query.execute()

  return result
}

export async function getWatchlistById(id: number, database: D1Database) {
  const db = createDB(database)
  return db.selectFrom('watchlist').selectAll().where('id', '=', id).executeTakeFirstOrThrow()
}

export async function deleteWatchlistById(id: number, database: D1Database) {
  const db = createDB(database)
  await db.deleteFrom('watchlistItem').where('watchlistId', '=', id).execute()
  await db.deleteFrom('watchlist').where('id', '=', id).execute()
}

export async function createWatchlist(params: WatchlistCreateParams, database: D1Database) {
  const db = createDB(database)

  const currentDefault = await db
    .selectFrom('watchlist')
    .selectAll()
    .where('address', '=', params.address)
    .where('isDefault', '=', 1)
    .executeTakeFirst()

  if (params.isDefault && currentDefault) {
    const updateResult = await db.updateTable('watchlist').set({ isDefault: 0 }).where('id', '=', currentDefault.id).executeTakeFirst()
    if (!updateResult.numUpdatedRows) {
      throw new Error('update watchlist failed')
    }
  }

  try {
    return db
      .insertInto('watchlist')
      .values({
        address: params.address,
        name: params.name,
        isDefault: params.isDefault || 0,
      })
      .returningAll()
      .executeTakeFirstOrThrow()
  } catch (e) {
    if (currentDefault) {
      await db.updateTable('watchlist').set({ isDefault: 1 }).where('id', '=', currentDefault.id).execute()
    }
    throw e
  }
}

export async function updateWatchlist(params: Pick<WatchlistCreateParams, 'name' | 'address'> & { id: number }, database: D1Database) {
  const db = createDB(database)

  const updatedWatchlist = await db
    .updateTable('watchlist')
    .set({ name: params.name })
    .where('id', '=', params.id)
    .where('address', '=', params.address)
    .returningAll()
    .executeTakeFirstOrThrow()

  return updatedWatchlist
}

export async function getDefaultWatchlist(params: Omit<WatchlistSearchParams, 'isDefault'>, database: D1Database) {
  const db = createDB(database)

  return db.selectFrom('watchlist').selectAll().where('address', '=', params.address).where('isDefault', '=', 1).executeTakeFirst()
}

export async function getOrCreateDefaultWatchlist(params: WatchlistSearchParams, database: D1Database) {
  const db = createDB(database)

  const exists = await db
    .selectFrom('watchlist')
    .selectAll()
    .where('address', '=', params.address)
    .where('isDefault', '=', 1)
    .executeTakeFirst()

  if (!exists) {
    const query = db
      .insertInto('watchlist')
      .values({
        address: params.address,
        isDefault: 1,
      })
      .returningAll()

    return query.executeTakeFirstOrThrow()
  }

  return exists
}

export async function setDefaultWatchlist(params: WatchlistSearchParams & { id: number }, database: D1Database) {
  const db = createDB(database)

  const currentDefault = await db
    .selectFrom('watchlist')
    .select('id')
    .where('address', '=', params.address)
    .where('isDefault', '=', 1)
    .executeTakeFirst()

  if (currentDefault) {
    await db
      .updateTable('watchlist')
      .set({ isDefault: 0, updatedAt: sql`datetime('now')` })
      .where('id', '=', currentDefault.id)
      .executeTakeFirstOrThrow()
  }

  try {
    const newDefault = await db
      .updateTable('watchlist')
      .set({ isDefault: 1, updatedAt: sql`datetime('now')` })
      .where('id', '=', params.id)
      .executeTakeFirstOrThrow()
    return newDefault
  } catch (e) {
    if (currentDefault) {
      await db
        .updateTable('watchlist')
        .set({ isDefault: 1, updatedAt: sql`datetime('now')` })
        .where('id', '=', currentDefault.id)
        .executeTakeFirstOrThrow()
    }
    throw e
  }
}

export async function searchWatchlistItems(searchQuery: WatchlistItemsSearchQuery, database: D1Database) {
  const db = createDB(database)

  let query = db
    .selectFrom('watchlistItem')
    .selectAll()
    .where('watchlistId', '=', searchQuery.watchlistId)
    .where('chain', '=', searchQuery.chain)

  if (searchQuery.type) {
    query = query.where('type', '=', searchQuery.type)
  }

  if (searchQuery.itemId) {
    query = query.where('itemId', '=', searchQuery.itemId)
  }

  if (searchQuery.sort === 'createdAt_ASC') {
    query = query.orderBy('createdAt', 'asc')
  }
  if (searchQuery.sort === 'createdAt_DESC') {
    query = query.orderBy('createdAt', 'desc')
  }

  if (searchQuery.limit) {
    query = query.limit(Math.min(Number(searchQuery.limit), 25))
  }

  if (searchQuery.offset) {
    query = query.offset(Math.max(Number(searchQuery.offset), 0))
  }

  try {
    return query.execute()
  } catch (error) {
    console.error(error)
    return []
  }
}
export async function countWatchlistItems(searchQuery: Omit<WatchlistItemsSearchQuery, 'limit' | 'offset'>, database: D1Database) {
  const db = createDB(database)

  let query = db
    .selectFrom('watchlistItem')
    .select((eb) => eb.fn.countAll<number>().as('count'))
    .where('watchlistId', '=', searchQuery.watchlistId)
    .where('chain', '=', searchQuery.chain)

  if (searchQuery.type) {
    query = query.where('type', '=', searchQuery.type)
  }

  if (searchQuery.itemId) {
    query = query.where('itemId', '=', searchQuery.itemId)
  }

  const result = await query.executeTakeFirst()

  return result?.count || 0
}

export async function createWatchlistItem(params: WatchlistItemCreateParams, database: D1Database) {
  const db = createDB(database)

  const created = await db
    .insertInto('watchlistItem')
    .values({
      chain: params.chain,
      type: params.type,
      watchlistId: params.watchlistId,
      itemId: params.itemId,
    })
    .returningAll()
    .executeTakeFirstOrThrow()

  await db
    .updateTable('watchlist')
    .set((eb) => ({ itemsCount: eb('itemsCount', '+', 1), updatedAt: sql`datetime('now')` }))
    .where('id', '=', params.watchlistId)
    .executeTakeFirstOrThrow()

  return created
}

export async function deleteWatchlistItem(
  params: Pick<WatchlistItemCreateParams, 'chain' | 'watchlistId' | 'itemId'>,
  database: D1Database,
) {
  const db = createDB(database)

  const deleteResult = await db
    .deleteFrom('watchlistItem')
    .where('chain', '=', params.chain)
    .where('watchlistId', '=', params.watchlistId)
    .where('itemId', '=', params.itemId)
    .executeTakeFirstOrThrow()

  if (deleteResult.numDeletedRows > 0) {
    await db
      .updateTable('watchlist')
      .set((eb) => ({ itemsCount: eb('itemsCount', '-', 1), updatedAt: sql`datetime('now')` }))
      .where('id', '=', params.watchlistId)
      .executeTakeFirstOrThrow()
  }
}
