import { Buffer } from 'node:buffer'
import { Context } from 'hono'

import { HonoEnv } from './constants'
import { createNode } from './helia'
import { unixfs } from '@helia/unixfs'

export async function getUint8ArrayFromFile(file: File): Promise<Uint8Array> {
  return new Uint8Array(await file.arrayBuffer())
}

export function getObjectSize(obj: Record<string, any>) {
  return Buffer.byteLength(JSON.stringify(obj))
}

export async function getDirectoryCID({
  c,
  files,
}: {
  files: { file: File; content: Uint8Array }[]
  c: Context<HonoEnv>
}): Promise<string> {
  const helia = await createNode(c)
  const fs = unixfs(helia)

  const addedFiles: { file: File; cid: any }[] = await Promise.all(
    files.map(async ({ file, content }) => {
      try {
        const cid = await fs.addFile({ path: file.name, content })
        return { file, cid }
      } catch (error) {
        throw new Error(`Failed to add file ${file.name}: ${error?.message}`)
      }
    }),
  )

  let dirCid = await fs.addDirectory()

  for (const { file, cid } of addedFiles) {
    dirCid = await fs.cp(cid, dirCid, file.name)
  }

  // using v0 since filebase uses that
  return dirCid.toV0().toString()
}
