import { vValidator } from '@hono/valibot-validator'
import { Hono } from 'hono'
import { array, blob, object, union } from 'valibot'
import type { HonoEnv } from '../utils/constants'
import {
	getObjectSize,
	getUint8ArrayFromFile,
	hashOf,
	keyOf,
} from '../utils/format'
import toCar from '../utils/ipfs'
import { getS3 } from '../utils/s3'

const app = new Hono<HonoEnv>()

app.post('/pinJson', vValidator('json', object({})), async (c) => {
	const body = await c.req.json()
	const type = 'application/json'
	const s3 = getS3(c)

	const content = JSON.stringify(body)
	const cid = (await hashOf(content)).toV0().toString()

	await s3.putObject({
		Body: content,
		Bucket: c.env.FILEBASE_BUCKET_NAME,
		Key: cid,
		ContentType: type,
	})

	c.executionCtx.waitUntil(
		c.env.BUCKET.put(keyOf(cid), new Blob([content], { type })),
	)

	return c.json(
		getPinResponse({
			cid: cid,
			type: type,
			size: getObjectSize(body),
		}),
	)
})

const fileRequiredMessage = 'File is required'
const fileKey = 'file'

type PinFile = { [fileKey]: File } | { [fileKey]: File[] }

const pinFileRequestSchema = object({
	[fileKey]: union([
		blob(fileRequiredMessage),
		array(blob(fileRequiredMessage)),
	]),
})

app.post('/pinFile', vValidator('form', pinFileRequestSchema), async (c) => {
	const body = (await c.req.parseBody({ all: true })) as PinFile

	const files = await Promise.all(
		([[body[fileKey]]].flat(2).filter(Boolean) as File[]).map(async (file) => ({
			file,
			content: await getUint8ArrayFromFile(file),
		})),
	)

	const s3 = getS3(c)

	let cid: string
	let file: Blob | File
	let type: string

	if (files.length > 1) {
		const { root, car } = await toCar(
			files.map(({ file, content }) => ({
				path: file.name,
				content: content,
			})),
		)

		cid = root.toString()
		file = car
		type = 'directory'

		await s3.putObject({
			Body: car,
			Bucket: c.env.FILEBASE_BUCKET_NAME,
			Key: cid,
			ContentType: 'application/vnd.ipld.car',
			Metadata: {
				import: 'car',
			},
		})

		for (const { file } of files) {
			const path = `${cid}/${file.name}`
			c.executionCtx.waitUntil(c.env.BUCKET.put(keyOf(path), file))
		}

	} else {
		const { content, file: f } = files[0]
		cid = (await hashOf(content)).toV0().toString()

		file = f
		type = f.type

		await s3.putObject({
			Body: content,
			Bucket: c.env.FILEBASE_BUCKET_NAME,
			Key: cid,
			ContentType: f.type,
		})

		c.executionCtx.waitUntil(c.env.BUCKET.put(keyOf(cid), file))
	}

	return c.json(
		getPinResponse({
			cid: cid,
			type: type,
			size: file.size,
		}),
	)
})

const getPinResponse = (value: {
	cid: string
	type: string
	size: number
}) => ({
	ok: true,
	value,
})

export { app as pinning }
