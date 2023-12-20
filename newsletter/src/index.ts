import { Hono } from 'hono';
import { subscribe, getSubscriptionByEmail, deleteSubscription } from './utils/beehiiv';
import { HonoEnv } from './utils/types';
import { cors } from 'hono/cors';
import { allowedOrigin } from './utils/cors';
import { subscribeValidator, checkSubscriptionValidator } from './utils/validators';
import { getResponse } from './utils/response';

const app = new Hono<HonoEnv>();

app.use('*', cors({ origin: allowedOrigin }));

app.post('/subscribe', subscribeValidator, async (c) => {
	const { email } = c.req.valid('json');

	const response = await subscribe(email, c);

	if (response.status !== 201) {
		return c.json(getResponse('Something went wrong'), response.status);
	}

	return c.json(undefined, 204);
});

app.get('/subscribe/:email', checkSubscriptionValidator, async (c) => {
	const email = c.req.param('email');

	const response = await getSubscriptionByEmail(email, c);

	if (response.status !== 200) {
		return c.json(getResponse('Unable to check subscription'), response.status);
	}

	const { data } = await response.json();

	return c.json(
		{
			email: data.email,
			status: data.status,
		},
		200
	);
});

app.put('/subscribe/resend-confirmation', subscribeValidator, async (c) => {
	const { email } = c.req.valid('json');

	const response = await getSubscriptionByEmail(email, c);

	if (response.status !== 200) {
		return c.json(getResponse('Unable to resend confirmation email'), response.status);
	}

	const { data } = await response.json();

	const isActive = data.status === 'active';

	if (!isActive) {
		await deleteSubscription(data.id, c);
		await subscribe(email, c);
	}

	return c.json(undefined, 204);
});

export default app;
