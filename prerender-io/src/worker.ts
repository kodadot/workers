import isbot from "isbot";
import { IGNORE_EXTENSIONS } from "./constant";

export interface Env {
	PRERENDER_TOKEN: string;
}

export default {
	async fetch(request: Request, env: Env): Promise<Response> {
		const url = new URL(request.url);
		const userAgent = request.headers.get("User-Agent")?.toLowerCase() || "";
		const isPrerender = request.headers.get("X-Prerender");
		const pathName = url.pathname.toLowerCase();
		const extension = pathName
			.substring(pathName.lastIndexOf(".") || pathName.length)
			?.toLowerCase();

		// Prerender loop protection
		// Non robot user agent
		// Ignore extensions
		if (
			isPrerender ||
			!isbot(userAgent) ||
			(extension.length && IGNORE_EXTENSIONS.includes(extension))
		) {
			return fetch(request);
		}

		// Build Prerender request
		const newURL = `https://service.prerender.io/${request.url}`;
		const newHeaders = new Headers(request.headers);

		newHeaders.set("X-Prerender-Token", env.PRERENDER_TOKEN);

		return fetch(new Request(newURL, {
			headers: newHeaders,
			redirect: "manual",
		}));
  },
};
