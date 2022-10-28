import { PRERENDERED_DOMAINS, BOT_AGENTS, IGNORE_EXTENSIONS } from './constant';
import { isOneOfThem, containsOneOfThem } from './helper';
import netlifyRequest from './netlify';

/**
 * This attaches the event listener that gets invoked when CloudFlare receives
 * a request.
 */
export default {
  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);
    const { origin, pathname, search } = url;
    const requestUserAgent = (
      request.headers.get('User-Agent') || ''
    ).toLowerCase();
    const pathName = url.pathname.toLowerCase();
    const ext = pathName.substring(
      pathName.lastIndexOf('.') || pathName.length
    );

    if (
      containsOneOfThem(BOT_AGENTS, requestUserAgent) &&
      !isOneOfThem(IGNORE_EXTENSIONS, ext) &&
      isOneOfThem(PRERENDERED_DOMAINS, origin)
    ) {
      return await netlifyRequest(request, `${pathname}${search}`);
    }

    return fetch(request.url);
  },
};
