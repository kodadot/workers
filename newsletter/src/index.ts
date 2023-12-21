import { Hono } from 'hono';
import { subscribe, getSubscriptionByEmail, deleteSubscription, indexPosts } from './utils/beehiiv';
import { HonoEnv } from './utils/types';
import { cors } from 'hono/cors';
import { allowedOrigin } from './utils/cors';
import { subscribeValidator, checkSubscriptionValidator, resendEmailValidator } from './middleware/validators';
import { getResponse } from './utils/response';

const app = new Hono<HonoEnv>();

app.use('*', cors({ origin: allowedOrigin }));

app.post('/subscribe', subscribeValidator, async (c) => {
	const { email } = c.req.valid('json');

	const response = await subscribe(email, c);

	if (response.status !== 201) {
		return c.json(getResponse('Something went wrong'), response.status);
	}

	const { data } = await response.json();

	return c.json({ id: data.id }, 201);
});

app.get('/subscribe/:subscriptionId', checkSubscriptionValidator, async (c) => {
	const subscriptionId = c.req.param('subscriptionId');

	const response = await getSubscriptionById(subscriptionId, c);

	if (response.status !== 200) {
		return c.json(getResponse('Unable to check subscription'), response.status);
	}

	const { data } = await response.json();

	return c.json(
		{
			id: data.id,
			email: data.email,
			status: data.status,
		},
		200
	);
});

app.put('/subscribe/resend-confirmation', resendEmailValidator, async (c) => {
	const { subscriptionId } = c.req.valid('json');

	const response = await getSubscriptionById(subscriptionId, c);

	if (response.status !== 200) {
		return c.json(getResponse('Unable to resend confirmation email'), response.status);
	}

	const { data } = await response.json();

	const isActive = data.status === 'active';

	let id = data.id;

	if (!isActive) {
		await deleteSubscription(data.id, c);
		const newSubscriptionResponse = await subscribe(data.email, c);
		const { data: newSubscription } = await newSubscriptionResponse.json();
		id = newSubscription.id;
	}

	return c.json({ id }, 201);
});

app.get('/index', async (c) => {
	const response = await indexPosts(c);

	if (response.status !== 200) {
		return c.json(getResponse('Unable to index posts'), response.status);
	}

	const { data } = (await response.json()) as { data: unknown };

	return c.json(data, 200);
});

export default app;
