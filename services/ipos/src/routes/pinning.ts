import { Hono } from 'hono'
import { HonoEnv } from '../utils/constants'
import { vValidator } from '@hono/valibot-validator'
import { blob, object, union, array } from 'valibot'
import { getUint8ArrayFromFile, getObjectSize, hashOf } from '../utils/format'
import { getS3 } from '../utils/s3'
import { getDirectoryCID } from '../utils/helia'

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

  c.executionCtx.waitUntil(c.env.BUCKET.put(cid, new Blob([content], { type })))

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

type PinFIle = { [fileKey]: File } | { [fileKey]: File[] }

const pinFileRequestSchema = object({
  [fileKey]: union([
    blob(fileRequiredMessage),
    array(blob(fileRequiredMessage)),
  ]),
})

app.post('/pinFile', vValidator('form', pinFileRequestSchema), async (c) => {
  const body = (await c.req.parseBody({ all: true })) as PinFIle

  const files = await Promise.all(
    ([[body[fileKey]]].flat(2).filter(Boolean) as File[]).map(async (file) => ({
      file,
      content: await getUint8ArrayFromFile(file),
    })),
  )

  const hasMultipleFiles = files.length > 1
  const s3 = getS3(c)

  let directoryCId: string | undefined

  if (hasMultipleFiles) {
    directoryCId = (await getDirectoryCID({ files, c })).toV0().toString()
  }

  const addedFiles: { file: File; cid: string; content: Uint8Array }[] =
    await Promise.all(
      files.map(async ({ file, content }) => {
        try {
          const cid = (await hashOf(content)).toV0().toString()
          const prefix = directoryCId ? `${directoryCId}/` : ''

          await s3.putObject({
            Body: content,
            Bucket: c.env.FILEBASE_BUCKET_NAME,
            Key: `${prefix}${cid}`,
            ContentType: file.type,
          })

          console.log('File added', cid)
          return { file, cid, content }
        } catch (error) {
          throw new Error(`Failed to add file ${file.name}: ${error?.message}`)
        }
      }),
    )

  c.executionCtx.waitUntil(
    Promise.all(
      addedFiles.map(({ content, cid }) => c.env.BUCKET.put(cid, content)),
    ),
  )

  const size = files.reduce((reducer, file) => reducer + file.file.size, 0)
  const { cid: addedFileCid, file } = addedFiles[0]
  let cid = addedFileCid
  let type = file.type

  if (hasMultipleFiles) {
    cid = directoryCId as string
    type = 'directory'
  }

  return c.json(
    getPinResponse({
      cid: cid,
      type: type,
      size: size,
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
