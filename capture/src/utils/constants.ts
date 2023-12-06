export type Env = {
	BW: Fetcher;
	BUCKET: R2Bucket;
	BROWSER: DurableObjectNamespace;
	PUBLIC_URL: string;
	// BROWSER_CACHE: KVNamespace;
};

export const ORIGIN = 'https://kodadot.xyz';


const DEFAULT_VIEWPORT_WIDTH = 600;
const DEFAULT_VIEWPORT_HEIGHT = 600;

export const viewportSettings = {
	deviceScaleFactor: 1,
	width: DEFAULT_VIEWPORT_WIDTH,
	height: DEFAULT_VIEWPORT_HEIGHT,
};
