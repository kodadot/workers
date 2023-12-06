import { $URL, withTrailingSlash } from 'ufo'

export function urlToFileName(url: string): string {
	const normalizedUrl = new $URL(url);

	const path = withTrailingSlash(normalizedUrl.pathname.replace('/ipfs/', ''));

	const fileName = path + normalizedUrl.query.hash + '.png';
	return fileName;
}

export const sleep = (time?: number) =>
  new Promise(resolve => {
    setTimeout(resolve, time)
  })
