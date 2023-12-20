export type Env = {
	BW: Fetcher;
	BUCKET: R2Bucket;
	BROWSER: DurableObjectNamespace;
	PUBLIC_URL: string;
	// BROWSER_CACHE: KVNamespace;
};

export const ORIGIN = 'https://kodadot.xyz';
