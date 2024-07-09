import { Context } from 'hono'
import { S3 } from '@aws-sdk/client-s3'

import { HonoEnv } from './constants'

export function getS3(c: Context<HonoEnv>): S3 {
  return new S3({
    region: 'auto',
    endpoint: `https://${c.env.S3_ACCOUNT_ID}.r2.cloudflarestorage.com/`,
    credentials: {
      accessKeyId: c.env.S3_ACCESS_KEY_ID,
      secretAccessKey: c.env.S3_SECRET_ACCESS_KEY,
    },
  })
}
