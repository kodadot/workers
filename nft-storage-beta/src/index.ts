import { Hono } from 'hono';
import { logger } from 'hono/logger';

import type { Bindings } from './utils/constants';
import { pinFile, uploadToCloudflareImages } from './utils/upload';

const app = new Hono<Bindings>();

app.use('*', logger());
app.get('/', (c) => c.text('hello nft-storage!'));

app.post('/pinFile', async (c) => {
  const status = await pinFile(c);

  if (status.cid) {
    // upload to cf-images in the background
    c.executionCtx.waitUntil(uploadToCloudflareImages(c, status.cid));
  }

  return c.json(status);
});

app.post('/pinJson', async (c) => {
  const status = await pinFile(c);
  return c.json(status);
});

export default app;
