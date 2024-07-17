import { createHelia } from 'helia'
import { MemoryBlockstore } from 'blockstore-core'
import { Context } from 'hono'

import { HonoEnv } from './constants'
import { unixfs } from '@helia/unixfs'
import { CID } from 'multiformats'

export async function createNode(c: Context<HonoEnv>) {
  const blockstore = new MemoryBlockstore()
  return await createHelia({ blockstore })
}

export async function getDirectoryCID({
  c,
  files,
}: {
  files: { file: File; content: Uint8Array }[]
  c: Context<HonoEnv>
}): Promise<CID> {
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


  return dirCid
}
