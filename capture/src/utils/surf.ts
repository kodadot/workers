import { type Page as PuppeteerPage } from '@cloudflare/puppeteer';
import { $URL, withTrailingSlash } from 'ufo';
import { viewportSettings } from './constants'
import { Settings as CaptureSettings } from './types'
import { sleep } from './shared'

export type Screenshot = {
	name: string;
	data: string | Buffer;
}

type SC = Screenshot


export async function captureAll(page: PuppeteerPage, urls: string[], settings?: CaptureSettings): Promise<SC[]> {
	const screenshots: SC[] = [];
	for (const url of urls) {
		const sc = await doScreenshot(page, url, settings);
		if (sc) {
			screenshots.push(sc);
		}
	}
	return screenshots;
}


async function doScreenshot(page: PuppeteerPage, url: string, settings?: CaptureSettings): Promise<SC | undefined> {
	await page.setViewport(viewportSettings);
	await page.goto(url);

	const selector = 'canvas';
	await page.waitForSelector(selector);

	const element = await page.$(selector);

	if (!element) {
		console.log(`Browser: element not found`);
		return undefined
	}

	const normalizedUrl = new $URL(url);

	const path = withTrailingSlash(normalizedUrl.pathname.replace('/ipfs/', ''));

	const fileName = path + normalizedUrl.query.hash + '.png';

	if (settings?.delay) {
		await sleep(settings.delay);
	}

	const sc = await element.screenshot();

	// await this.env.BUCKET.put(fileName, sc);
	return { name: fileName, data: sc };
}
