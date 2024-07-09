import { createHelia } from 'helia'
import { S3Blockstore } from 'blockstore-s3'
import { Context } from 'hono'

import { getS3 } from './s3'
import { HonoEnv } from './constants'

export async function createNode(c: Context<HonoEnv>) {
  const blockstore = new S3Blockstore(getS3(c), 'ipos')
  return await createHelia({ blockstore })
}
