import puppeteer from '@cloudflare/puppeteer';
import { Env } from './utils/constants';
import { Context, Hono } from 'hono';
import { cors } from 'hono/cors';

import { allowedOrigin } from './utils/cors';

export { Browser } from './object';

type Bindings = { Bindings: Env }

const app = new Hono<Bindings>();

type ScreenshotRequest = {
	url: string;
};

type BatchRequest = {
	urls: string[];
};

app.get('/', (c) => c.text('KODADOT CAPTURE SERVICE - https://kodadot.xyz'));

app.use('/batch', cors({ origin: allowedOrigin }));

async function capture(c: Context<Bindings>, batch: BatchRequest) {
	const id = c.env.BROWSER.idFromName('browser');
	const obj = c.env.BROWSER.get(id);
	const resp = await obj.fetch(c.req.url, { body: JSON.stringify(batch), method: 'POST' });

	return resp
}

app.post('/batch', async (c) => {
	const urls = await c.req.json<BatchRequest>();

	const resp = await capture(c, urls);

	if (resp.ok === false) {
		return c.text('Unable to capture', 400);
	}

	const saved = await resp.json() as { captures: string[] };

	return c.json(saved.captures.map(cap => c.env.PUBLIC_URL + '/' + cap), 200);
});

app.use('/screenshot', cors({ origin: allowedOrigin }));

app.post('/screenshot', async (c) => {
	const body = await c.req.json<ScreenshotRequest>();
	const url = body.url;

	if (!url) {
		return c.json({ error: 'url is required, example: {"url": "https://example.com}' }, 400);
	}

	const resp = await capture(c, {urls: [url]});


	if (resp.ok === false) {
		return c.text('Unable to capture', 400);
	}

	const saved = await resp.json() as { captures: string[] };

	if (saved.captures.length === 0 && saved.captures.at(0) !== undefined) {
		return c.text('Unable to capture', 400);
	}

	const image = await c.env.BUCKET.get(saved.captures.at(0)!);


	if (!image) {
		return c.text('No image saved', 400);
	}

	const img = await image.arrayBuffer();

	return new Response(img, {
		headers: {
			'content-type': 'image/png',
		},
	});
});

export default app;
