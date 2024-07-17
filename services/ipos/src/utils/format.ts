import { Buffer } from 'node:buffer'
import { ImportContent } from 'ipfs-unixfs-importer'
import { CID } from 'multiformats'
import Hash from 'ipfs-only-hash'

export async function getUint8ArrayFromFile(file: File): Promise<Uint8Array> {
  return new Uint8Array(await file.arrayBuffer())
}

export function getObjectSize(obj: Record<string, any>) {
  return Buffer.byteLength(JSON.stringify(obj))
}

export async function hashOf(content: ImportContent | string): Promise<CID> {
  return CID.parse(await Hash.of(content, { onlyHash: true, cidVersion: 1 }))
}
