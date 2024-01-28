import { type Page as PuppeteerPage } from '@cloudflare/puppeteer'
import { Buffer } from 'node:buffer'
import { $URL, withTrailingSlash } from 'ufo'
import { Settings as CaptureSettings } from './types'

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

const performCanvasCapture = async (page: PuppeteerPage, canvasSelector: string) => {
  try {
    // get the base64 image from the CANVAS targetted
    const base64 = await page.$eval(canvasSelector, el => {
      if (!el || el.tagName !== "CANVAS") return null
      return el.toDataURL()
    })
    if (!base64) throw new Error("No canvas found")
    // remove the base64 mimetype at the beginning of the string
    const pureBase64 = base64.replace(/^data:image\/png;base64,/, "")
    return Buffer.from(pureBase64, "base64")
  } catch (err) {
    return null
  }
}


async function doScreenshot(page: PuppeteerPage, url: string, settings?: CaptureSettings): Promise<SC | undefined> {

	await page.goto(url);

	const selector = 'canvas';

	if (settings?.delay) {
		console.log(`Browser: waiting ${settings.delay}ms`);
	 await new Promise(r => setTimeout(r, settings?.delay));
	}

	// await page.waitForSelector(selector);

	const element = await performCanvasCapture(page, selector) //await page.$(selector);

	if (!element) {
		console.log(`Browser: element not found`);
		return undefined
	}

	const normalizedUrl = new $URL(url);

	const path = withTrailingSlash(normalizedUrl.pathname.replace('/ipfs/', ''));

	const fileName = path + normalizedUrl.query.hash + '.png';

	const sc = element //await element.screenshot();

	// await this.env.BUCKET.put(fileName, sc);
	return { name: fileName, data: sc };
}
