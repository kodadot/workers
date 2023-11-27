import puppeteer, { type Browser as PuppeteerBrowser } from '@cloudflare/puppeteer';
import { Env } from './utils/constants';

const KEEP_BROWSER_ALIVE_IN_SECONDS = 60;
const DEFAULT_VIEWPORT_WIDTH = 800
const DEFAULT_VIEWPORT_HEIGHT = 800
const PAGE_TIMEOUT = 300000

const viewportSettings = {
	deviceScaleFactor: 1,
	width: DEFAULT_VIEWPORT_WIDTH,
	height: DEFAULT_VIEWPORT_HEIGHT,
}

type ScreenshotRequest = {
	urls: string[]
}

export class Browser {
	state: DurableObjectState;
	env: Env;
	keptAliveInSeconds: number;
	storage: DurableObjectStorage;
	browser?: PuppeteerBrowser;

	constructor(state: DurableObjectState, env: Env) {
		this.state = state;
		this.env = env;
		this.keptAliveInSeconds = 0;
		this.storage = this.state.storage;
	}


	private async initBrowser() {
		if (!this.browser || !this.browser.isConnected()) {
			console.log(`Browser DO: Starting new instance`);
			try {
				this.browser = await puppeteer.launch(this.env.BW);
			} catch (e) {
				console.log(`Browser DO: Could not start browser instance. Error: ${e}`);
			}
		}
	}


	async fetch(request: Request) {
		// return new Response("success");
		const body = await request.json() as ScreenshotRequest;
		const urls = body.urls.filter(Boolean);

		console.log(`Browser DO: Fetching ${urls.length} urls`);

		await this.initBrowser();

		// Reset keptAlive after each call to the DO
		this.keptAliveInSeconds = 0;

		console.log(`Browser DO: Fetching ${this.browser}`);


		if (!this.browser) {
			return new Response('Browser DO: Could not start browser instance.', { status: 499 });
		}

		const page = await this.browser.newPage();


		const captures = [];

		for (const url of urls) {
			await page.setViewport(viewportSettings);
			await page.goto(url);

			const selector = 'canvas';
			await page.waitForSelector(selector);

			const element = await page.$(selector);

			if (!element) {
				console.log(`Browser: element not found`);
				continue
			}

			const normalizedUrl = new URL(url);

			const fileName = normalizedUrl.pathname.replace(/\//g, '_') + '_' + normalizedUrl.searchParams.get('hash');


			const sc = await element.screenshot();

			await this.env.BUCKET.put(fileName + '.jpeg', sc);
			captures.push(this.env.PUBLIC_URL + '/' + fileName + '.jpeg');

		}

		// Reset keptAlive after performing tasks to the DO.
		this.keptAliveInSeconds = 0;

		// set the first alarm to keep DO alive
		let currentAlarm = await this.storage.getAlarm();
		if (currentAlarm == null) {
			console.log(`Browser DO: setting alarm`);
			const TEN_SECONDS = 10 * 1000;
			await this.storage.setAlarm(Date.now() + TEN_SECONDS);
		}

		return new Response(JSON.stringify({ captures }));
	}

	async alarm() {
		this.keptAliveInSeconds += 10;

		// Extend browser DO life
		if (this.keptAliveInSeconds < KEEP_BROWSER_ALIVE_IN_SECONDS) {
			console.log(`Browser DO: has been kept alive for ${this.keptAliveInSeconds} seconds. Extending lifespan.`);
			await this.storage.setAlarm(Date.now() + 10 * 1000);
		} else {
			console.log(`Browser DO: exceeded life of ${KEEP_BROWSER_ALIVE_IN_SECONDS}s.`);
			if (this.browser) {
				console.log(`Closing browser.`);
				await this.browser.close();
			}
		}
	}
}
