import { Env } from './utils/constants';
import { Hono } from 'hono';
import type { Prefix } from '@kodadot1/static';
import { cryptoWaitReady } from '@polkadot/util-crypto';
import { validateRequest } from '../middleware/validateRequest';
import { api } from '../utils/api';
import { generateId, nextSn } from '../utils/utils';
import { insertCollectiveItem } from '../utils/queries';




const app = new Hono<{ Bindings: Env }>();

await cryptoWaitReady();

app.use('/collectives', validateRequest);

app.get('/', (c) => c.text('Hello! cf-workers!'));

// POST endpoint to create a new collective item.
app.post('/collectives', async (c) => {
	const body = await c.req.json();
	const db: D1Database = c.env.DB;
	const apiInstance = await api(body.chain as Prefix);

	// Fetch the current max 'sn' and increment it.
	const newSn = await nextSn(db);

	// Generate the new 'id' with the new 'sn'.
	const id = generateId(body.chain, body.collection, newSn);

	// Insert the new item into the 'collective_items' table, excluding 'approved' and 'id'.
	const insertResult = await insertCollectiveItem(c.env.DB, {
		id: id,
		chain: body.chain,
		collection: body.collection,
		issuer: body.issuer,
		metadata: body.metadata,
		sn: newSn,
		signature: body.signature,
		mail: body.mail,
	}).all();

	if (insertResult) {
		return c.json({ id: id, sn: newSn, message: 'Collective item created successfully.' }, 201);
	} else {
		return c.json({ error: 'Failed to create collective item.' }, 500);
	}
});

export default app;
