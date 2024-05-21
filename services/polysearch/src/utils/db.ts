import { Kysely } from 'kysely'
import { D1Dialect } from 'kysely-d1'

export const tables = ['collections', 'items']

interface Database {
  collections: any
  items: any
}

export type SearchQuery = {
  table: keyof Database
  search: string
  chain?: string
  limit: number
  offset: number
}

type Dict = Record<string, any>

export function isTable(table: string): table is keyof Database {
  return tables.includes(table)
}

export async function doSearch<T>(params: SearchQuery, database: D1Database): Promise<any> {
  const table = params.table
  const search = params.search
  if (!isTable(table) || !search) {
    throw new Error(`Missing table (${table}) or search query (${search})`)
  }

  const db = new Kysely<Database>({ dialect: new D1Dialect({ database }) })

  let query =  db
    .selectFrom(table)
    .selectAll()
    .where('name', 'like', '%'+search+'%')

  if (params.chain) {
    query = query.where('chain', '=', params.chain)
  }

  if (params.limit) {
    query = query.limit(Math.min(Number(params.limit), 25))
  }

  if (params.offset) {
    query = query.offset(params.offset)
  }

  try {
    const res = await db.executeQuery(query.compile())
    return res?.rows || []

  } catch (error) {
    console.error(error)
    return []
  }
}

export async function insertInto(table: keyof Database, data: Dict | Dict[], database: D1Database) {
  const db = new Kysely<Database>({ dialect: new D1Dialect({ database }) })
  const query = db.insertInto(table).values(data)

  if (!isTable(table)) {
    return { ok: false, affected: -1, error: new Error(`Missing table (${table})`) }
  }

  try {
    const res = await db.executeQuery(query.compile())
    return { ok: true, affected: res.numAffectedRows, error: null }
  } catch (error) {
    console.error(error)
    return { ok: false,  affected: -1, error }
  }
}