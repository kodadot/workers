import { Kysely } from 'kysely'
import { D1Dialect } from 'kysely-d1'

export const tables = ['accounts', 'socials']

interface Database {
  accounts: any
  socials: any
  quests: any
  completed_quests: any
  statistics: any
}

export type SearchQuery = {
  table: keyof Database
  search: string
  chain?: string
  limit: number
  offset: number
}

type Dict = Record<string, any>
type Result = {
  [x: string]: any;
}

export function isTable(table: string): table is keyof Database {
  return tables.includes(table)
}

// const db = new Kysely<Database>({ dialect: new D1Dialect({ database: }) })

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

export async function save<T = any>(data: Dict | Dict[], table: keyof Database,  database: D1Database): Promise<Result | undefined> {
  const db = new Kysely<Database>({ dialect: new D1Dialect({ database }) })
  return db.insertInto(table).values(data).returningAll().executeTakeFirst()
}

export async function selectAll<T = any>(table: keyof Database, database: D1Database): Promise<Result[]> {
  const db = new Kysely<Database>({ dialect: new D1Dialect({ database }) })
  return db.selectFrom(table).selectAll().execute()
}

export async function findById<T = any>(id: string, table: keyof Database,  database: D1Database): Promise<Result | undefined> {
  const db = new Kysely<Database>({ dialect: new D1Dialect({ database }) })
  return db.selectFrom(table).selectAll().where('id', '=', id).executeTakeFirst()
}

export async function findAllByKey<T = any>(key: string, value: string, table: keyof Database,  database: D1Database): Promise<Result[]> {
  const db = new Kysely<Database>({ dialect: new D1Dialect({ database }) })
  return db.selectFrom(table).selectAll().where(key, '=', value).execute()
}

export async function findByHandle<T = any>(id: string, table: keyof Database, database: D1Database): Promise<any | undefined> {
  const db = new Kysely<Database>({ dialect: new D1Dialect({ database }) })
  return db.selectFrom(table).selectAll().where('handle', 'like', '%'+id+'%').executeTakeFirst()
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