import puppeteer, { type Browser as PuppeteerBrowser } from '@cloudflare/puppeteer'
import { Env } from './utils/constants'
import { captureAll } from './utils/surf'

const KEEP_BROWSER_ALIVE_IN_SECONDS = 120;
const DEFAULT_VIEWPORT_WIDTH = 600;
const DEFAULT_VIEWPORT_HEIGHT = 600;
const PAGE_TIMEOUT = 300000;

const viewportSettings = {
	deviceScaleFactor: 1,
	width: DEFAULT_VIEWPORT_WIDTH,
	height: DEFAULT_VIEWPORT_HEIGHT,
};

type ScreenshotRequest = {
	urls: string[];
};

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


	private resetKeepAlive() {
		this.keptAliveInSeconds = 0;
	}

	private async adjustAlarm() {
		// Reset keptAlive after performing tasks to the DO.
		this.resetKeepAlive();

		// set the first alarm to keep DO alive
		let currentAlarm = await this.storage.getAlarm();
		if (currentAlarm == null) {
			console.log(`Browser DO: setting alarm`);
			const TEN_SECONDS = 10 * 1000;
			await this.storage.setAlarm(Date.now() + TEN_SECONDS);
		}
	}

	async fetch(request: Request) {
		const body = (await request.json()) as ScreenshotRequest;
		const urls = body.urls.filter(Boolean);

		console.log(`Browser DO: Fetching ${urls.length} urls`);

		await this.initBrowser();

		// Reset keptAlive after each call to the DO
		this.resetKeepAlive();

		if (!this.browser) {
			return new Response('Browser DO: Could not start browser instance.', { status: 429 });
		}

		const page = await this.browser.newPage();

		const captures = await captureAll(page, urls);

		for (const sc of captures) {
			await this.env.BUCKET.put(sc.name, sc.data);
		}

		await this.adjustAlarm();

		return new Response(JSON.stringify({ captures: captures.map(c => c.name) }));
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
