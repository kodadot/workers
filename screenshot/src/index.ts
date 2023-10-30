import puppeteer from '@cloudflare/puppeteer';
import { Env } from './utils/constants';
import { Hono } from 'hono';
import { cors } from 'hono/cors';

import { allowedOrigin } from './utils/cors';

const app = new Hono<{ Bindings: Env }>();

app.get('/', (c) => c.text('Hello! cf-workers!'));
app.use('/screenshot', cors({ origin: allowedOrigin }));

app.post('/screenshot', async (c) => {
	const body = await c.req.json();
	const url = body.url;
	if (!url) {
		return c.json({ error: 'url is required, example: {"url": "https://example.com}' }, 400);
	}
	const normalizedUrl = new URL(url).toString();
	const cachedImg = await c.env.BROWSER_KV_DEMO.get(normalizedUrl, {
		type: 'arrayBuffer',
	});
	if (cachedImg) {
		return new Response(cachedImg, {
			headers: {
				'content-type': 'image/jpeg',
			},
		});
	}

	const browser = await puppeteer.launch(c.env.MYBROWSER);
	const page = await browser.newPage();
	await page.goto(url);
	const img = (await page.screenshot()) as Buffer;
	await c.env.BROWSER_KV_DEMO.put(url, img, {
		expirationTtl: 60 * 60 * 24,
	});
	await browser.close();
	return new Response(img, {
		headers: {
			'content-type': 'image/jpeg',
		},
	});
});

export default app;
