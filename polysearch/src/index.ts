/**
 * Welcome to Cloudflare Workers! This is your first worker.
 *
 * - Run `wrangler dev src/index.ts` in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your worker in action
 * - Run `wrangler publish src/index.ts --name my-worker` to publish your worker
 *
 * Learn more at https://developers.cloudflare.com/workers/
 */

import { Hono } from 'hono'
import { cors } from 'hono/cors'

import { allowedOrigin } from './utils/cors'

// const envAdapter = env<Bindings>()

const app = new Hono();

app.get('/', (c) => c.text('Hello! cf-workers!'));

app.use('/search', cors({ origin: allowedOrigin }));

export default app;

// export default {
// 	async fetch(
// 		request: Request,
// 		env: Bindings,
// 		ctx: ExecutionContext
// 	): Promise<Response> {
// 		return new Response("Hello World!");
// 	},
// };
