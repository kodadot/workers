import { S3 } from '@aws-sdk/client-s3'
import type { Context } from 'hono'

import type { HonoEnv } from './constants'

export function getS3(c: Context<HonoEnv>): S3 {
	return new S3({
		region: 'us-east-1', // region should be `us-east-1` do not change
		endpoint: 'https://s3.filebase.com',
		credentials: {
			accessKeyId: c.env.S3_ACCESS_KEY_ID,
			secretAccessKey: c.env.S3_SECRET_ACCESS_KEY,
		},
	})
}
