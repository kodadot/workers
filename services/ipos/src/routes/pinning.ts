import { Hono } from 'hono'
import { HonoEnv } from '../utils/constants'
import { vValidator } from '@hono/valibot-validator'
import { blob, object, union } from 'valibot'
import { createNode } from '../utils/helia'
import { unixfs } from '@helia/unixfs'

const app = new Hono<HonoEnv>()

app.post('/pinJson', vValidator('json', object({})), async (c) => {
  const json = await c.req.json()

  const fs = unixfs(await createNode(c))

  const bytes = Uint8Array.from(json)

  const size = bytes.byteLength

  const cid = await fs.addBytes(bytes)

  return c.json(
    pinResponse({ cid: cid.toString(), type: 'application/json', size }),
  )
})

type PinSingleFile = { file: File }
type PingMultipleFiles = { 'file[]': File[] }
type PinFIle = PinSingleFile | PingMultipleFiles

const pinFileRequestSchema = union([
  object({
    file: blob('File is required'),
  }),
  object({
    'file[]': blob('File is required'),
  }),
])

app.post('/pinFile', vValidator('form', pinFileRequestSchema), async (c) => {
  const body = (await c.req.parseBody()) as PinFIle

  const files = [body?.['file[]'], [body.file]].flat().filter(Boolean)

  console.log(files)

  const fs = unixfs(await createNode(c))

  const filesWithCIDs: { file: File; cid: any }[] = await Promise.all(
    files.map(async (file: File) => {
      try {
        const content = Uint8Array.from(await file.arrayBuffer())
        const cid = await fs.addFile({ path: file.name, content })
        return { file, cid }
      } catch (error) {
        throw new Error(`Failed to add file ${file.name}: ${error?.message}`)
      }
    }),
  )

  let cid

  if (files?.length > 1) {
    let dirCid = await fs.addDirectory()
    for (const { file, cid } of filesWithCIDs) {
      dirCid = await fs.cp(cid, dirCid, file.name)
    }
    cid = dirCid
  } else {
    cid = filesWithCIDs[0].cid
  }

  const stats = await fs.stat(cid)

  return c.json(
    pinResponse({
      cid: cid?.toString(),
      type: stats.type,
      size: Number(stats.fileSize),
    }),
  )
})

const pinResponse = (value: { cid: string; type: string; size: number }) => ({
  ok: true,
  value,
})

export { app as pinning }
