import { $URL, withTrailingSlash } from 'ufo'

export function urlToFileName(url: string): string {
	const normalizedUrl = new $URL(url);

	const path = withTrailingSlash(normalizedUrl.pathname.replace('/ipfs/', ''));

	const fileName = path + normalizedUrl.query.hash + '.png';
	return fileName;
}
