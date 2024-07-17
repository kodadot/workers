import { Env } from 'hono'

export interface CloudflareEnv extends Record<string, any> {
  BUCKET: R2Bucket

  // wrangler secret
  // S3
  S3_ACCESS_KEY_ID: string
  S3_SECRET_ACCESS_KEY: string
  
  // Filebase
  FILEBASE_BUCKET_NAME: string
}

export interface HonoEnv extends Env {
  Bindings: CloudflareEnv
}

export const ORIGIN = 'https://kodadot.xyz'
