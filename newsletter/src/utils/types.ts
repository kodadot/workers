import { Env } from 'hono'
import { Env as CloudflareEnv } from './constants'

export interface HonoEnv extends Env {
    Bindings: CloudflareEnv
}
