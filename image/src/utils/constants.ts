export const CACHE_DAY = 86400;
export const CACHE_WEEK = CACHE_DAY * 7;
export const CACHE_MONTH = CACHE_DAY * 30;

export interface Env {
  MY_BUCKET: R2Bucket;
  DEDICATED_GATEWAY: string;
  DEDICATED_BACKUP_GATEWAY: string;
  CLOUDFLARE_GATEWAY: string;
  CF_IMAGE_ACCOUNT: string;
  CF_IMAGE_ID: string;

  // wrangler secret
  IMAGE_API_TOKEN: string;
}
