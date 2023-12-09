import { Env } from 'hono'

interface CloudflareEnv extends Record<string, any> {
	DB: D1Database
}

export interface HonoEnv extends Env {
	Bindings: CloudflareEnv
}
