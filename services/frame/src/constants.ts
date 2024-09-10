// import { Fetcher } from '@cloudflare/workers-types'
import { Env } from 'hono'

export interface CloudflareEnv extends Record<string, any> {
  // WAIFU_DB: D1Database;
  // NFT_STORAGE: Fetcher
}

export interface HonoEnv extends Env {
  Bindings: CloudflareEnv
}
