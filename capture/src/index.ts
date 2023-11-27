import puppeteer from '@cloudflare/puppeteer';
import { Env } from './utils/constants';
import { Hono } from 'hono';
import { cors } from 'hono/cors';

import { allowedOrigin } from './utils/cors';

export { Browser } from './object';

const app = new Hono<{ Bindings: Env }>();

type ScreenshotRequest = {
	url: string
}

app.get('/', (c) => c.text('KODADOT CAPTURE SERVICE - https://kodadot.xyz'));

app.use('/batch', cors({ origin: allowedOrigin }));


app.post('/batch', async (c) => {
	const id = c.env.BROWSER.idFromName("browser");

	console.log('id',id);

	const obj = c.env.BROWSER.get(id);

	console.log('obj',obj);

	console.log('c.req.url',c.req.url);
	// Send a request to the Durable Object, then await its response.
	const resp = await obj.fetch(c.req.url, { body: JSON.stringify(await c.req.json()), method: 'POST' } )

	if (resp.status !== 200) {
		return c.json({ error: 'element not found' }, 400);
	}

	return c.json(await resp.json(), 200);
});


app.use('/screenshot', cors({ origin: allowedOrigin }));

app.post('/screenshot', async (c) => {
	const body = await c.req.json<ScreenshotRequest>();
	const url = body.url;
	// const normalizedUrl = new URL(url);
	// const hash = normalizedUrl.searchParams.get('hash');

	if (!url) {
		return c.json({ error: 'url is required, example: {"url": "https://example.com}' }, 400);
	}

	// const cachedImg = await c.env.BROWSER_KV_DEMO.get(normalizedUrl, {
	// 	type: 'arrayBuffer',
	// });
	// if (cachedImg) {
	// 	return new Response(cachedImg, {
	// 		headers: {
	// 			'content-type': 'image/jpeg',
	// 		},
	// 	});
	// }


	const browser = await puppeteer.launch(c.env.BW);
	const page = await browser.newPage();
	await page.goto(url);

	const selector = 'canvas';
	await page.waitForSelector(selector);

	const element = await page.$(selector);

	if (!element) {
		return c.json({ error: 'element not found' }, 400);
	}

	const img = await (element.screenshot()) as Buffer;

	// await c.env.BROWSER_KV_DEMO.put(url, img, {
	// 	expirationTtl: 60 * 60 * 24,
	// });
	await browser.close();
	return new Response(img, {
		headers: {
			'content-type': 'image/jpeg',
		},
	});
});

export default app;


