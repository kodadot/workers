import { validator } from 'hono/validator';
import { getResponse } from '../utils/response';
import { z } from 'zod';

const subscribeSchema = z.object({
	email: z.string().email(),
});

const checkSubscriptionSchema = z.object({
	subscriptionId: z.string(),
});

export const subscribeValidator = validator('json', (value, c) => {
	const parsed = subscribeSchema.safeParse(value);

	if (!parsed.success) {
		return c.json(getResponse('Invalid email'), 400);
	}

	return value;
});

const subscriptionValidation = (type: 'json' | 'param') =>
	validator(type, (value, c) => {
		const parsed = checkSubscriptionSchema.safeParse(value);

		if (!parsed.success) {
			return c.json(getResponse('Invalid subscription id'), 400);
		}

		return value;
	});

export const checkSubscriptionValidator = subscriptionValidation('param');

export const resendEmailValidator = subscriptionValidation('json');
