import type { Context } from 'hono';
import type { Bindings } from './constants';
import { NFTStorage, Blob } from 'nft.storage';

export async function uploadToCloudflareImages(
  c: Context<Bindings>,
  cid: string
) {
  const uploadHeaders = new Headers();
  uploadHeaders.append('Authorization', `Bearer ${c.env.IMAGE_API_TOKEN}`);

  const uploadFormData = new FormData();
  uploadFormData.append('url', `${c.env.NFTSTORAGE_IPFS}/ipfs/${cid}`);
  uploadFormData.append('id', cid);

  const requestOptions = {
    method: 'POST',
    headers: uploadHeaders,
    body: uploadFormData,
    redirect: 'follow',
  };

  await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${c.env.CF_IMAGE_ACCOUNT}/images/v1`,
    requestOptions
  );
}

export async function uploadToR2(c: Context<Bindings>, cid: string) {
  const objectName = `ipfs/${cid}`;
  const object = await c.env.R2_BUCKET.get(objectName);

  if (object === null) {
    const fetchIPFS = await Promise.any([
      fetch(`${c.env.DEDICATED_GATEWAY}/ipfs/${cid}`),
      fetch(`${c.env.NFTSTORAGE_IPFS}/ipfs/${cid}`),
    ]);
    const statusCode = fetchIPFS.status;

    if (statusCode === 200) {
      // put object to r2
      await c.env.R2_BUCKET.put(objectName, fetchIPFS.body, {
        httpMetadata: fetchIPFS.headers,
      });
    }
  }
}

export async function pinFile(c: Context<Bindings>) {
  const client = new NFTStorage({ token: c.env.NFT_STORAGE_TOKEN });
  const formData = await c.req.formData();
  const key = Array.from(formData.keys())[0];
  const file = formData.get(key) as unknown as File;
  const cid = await client.storeBlob(new Blob([file]));
  const status = await client.status(cid);

  // upload to r2 in the background
  c.executionCtx.waitUntil(uploadToR2(c, cid));

  return status;
}
