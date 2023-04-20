import { Kysely } from 'kysely'
import { D1Dialect } from 'kysely-d1'

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

export async function doSearch<T>(params: SearchQuery, database: D1Database): Promise<any> {
  const table = params.table
  const search = params.search
  if (!table || !search) {
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
