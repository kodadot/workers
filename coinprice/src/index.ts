import { Hono } from 'hono';
import { cors } from 'hono/cors';

import { cacheKey, getPrice, formatPrice, chainToken } from './utils';

type Bindings = {
  TOKENPRICE: KVNamespace;
};

const app = new Hono<{ Bindings: Bindings }>();

app.use('*', cors());

app.get('/', (c) => c.text('Hello Hono!'));

app.on(['GET', 'OPTIONS'], '/price/:chain', async (c) => {
  const { chain } = c.req.param();
  const token = chain as keyof typeof chainToken;

  const key = `${cacheKey()}-${token}`;
  const value = await c.env.TOKENPRICE.get(key);

  console.log(key, value);

  if (value === null) {
    try {
      const usd = await getPrice(token);
      console.log(chain, usd);

      c.executionCtx.waitUntil(c.env.TOKENPRICE.put(key, usd));

      return c.json(formatPrice(chain, usd));
    } catch (error) {
      console.log(error);
      return c.json({ error });
    }
  }

  return c.json(formatPrice(chain, value));
});

export default app;
