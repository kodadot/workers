import { Hono } from 'hono';
import { cors } from 'hono/cors';

import { HonoEnv } from './utils/constants';
import { pinning } from './routes/pinning';

const app = new Hono<HonoEnv>();

app.get('/', (c) => c.text('Hello <<Artists>>!'));
app.use('*', cors());

app.route('/', pinning);

app.onError((err, c) => {
	console.error(`${err}`);
	return c.json({ error: err.message, path: c.req.url }, 400);
});

export default app;
