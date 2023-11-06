export const validateRequest = async (c: any, next: Function) => {
	const body = await c.req.json();
	const requiredFields = ['chain', 'collection', 'issuer', 'metadata', 'signature', 'mail'];

	for (const field of requiredFields) {
		if (!body[field]) {
			return c.json({ error: `${field} is required` }, 400);
		}
	}

	await next();
};