import { Hono } from 'hono'
import { HonoEnv } from '../utils/constants'
import { vValidator } from '@hono/valibot-validator'
import { blob, object, union, array } from 'valibot'
import { createNode } from '../utils/helia'
import { unixfs } from '@helia/unixfs'
import { getUint8ArrayFromFile } from '../utils/helpers'

const app = new Hono<HonoEnv>()

app.post('/pinJson', vValidator('json', object({})), async (c) => {
  const json = await c.req.json()

  const helia = await createNode(c)
  const fs = unixfs(helia)

  const bytes = Uint8Array.from(json)
  const cid = await fs.addBytes(bytes)

  const stats = await fs.stat(cid)
  await helia.stop()

  return c.json(
    getPinResponse({
      cid: cid.toString(),
      type: 'application/json',
      size: Number(stats.fileSize),
    }),
  )
})

const fileRequiredMessage = 'File is required'
const fileKey = 'file'

type PinSingleFile = { [fileKey]: File }
type PingMultipleFiles = { [fileKey]: File[] }
type PinFIle = PinSingleFile | PingMultipleFiles

const pinFileRequestSchema = union([
  object({
    [fileKey]: blob(fileRequiredMessage),
  }),
  object({
    [fileKey]: array(blob(fileRequiredMessage)),
  }),
])

app.post('/pinFile', vValidator('form', pinFileRequestSchema), async (c) => {
  const body = (await c.req.parseBody({ all: true })) as PinFIle

  const files: File[] = [[(body as PinSingleFile)[fileKey]]]
    .flat(2)
    .filter(Boolean)

  const helia = await createNode(c)
  const fs = unixfs(helia)

  const addedFiles: { file: File; cid: any }[] = await Promise.all(
    files.map(async (file: File) => {
      try {
        const content = await getUint8ArrayFromFile(file)
        const cid = await fs.addFile({ path: file.name, content })
        console.log('File added', cid)
        return { file, cid }
      } catch (error) {
        throw new Error(`Failed to add file ${file.name}: ${error?.message}`)
      }
    }),
  )

  const { cid: addedFileCid, file } = addedFiles[0]
  let cid = addedFileCid
  let type = file.type

  if (files.length > 1) {
    console.log('Creating directory')
    let dirCid = await fs.addDirectory()
    for (const { file, cid } of addedFiles) {
      console.log(`Adding file ${cid} to directory ${dirCid}`)
      dirCid = await fs.cp(cid, dirCid, file.name)
    }

    cid = dirCid.toString()
    type = 'directory'
  }

  const stats = await fs.stat(cid)
  await helia.stop()

  return c.json(
    getPinResponse({
      cid: cid.toString(),
      type: type,
      size: Number(stats.fileSize),
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
