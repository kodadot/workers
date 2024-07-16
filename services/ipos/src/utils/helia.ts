import { createHelia } from 'helia'
import { MemoryBlockstore } from 'blockstore-core'
import { Context } from 'hono'

import { HonoEnv } from './constants'

export async function createNode(c: Context<HonoEnv>) {
  const blockstore = new MemoryBlockstore()
  return await createHelia({ blockstore })
}
