import { Buffer } from 'node:buffer'

export async function getUint8ArrayFromFile(file: File): Promise<Uint8Array> {
  return new Uint8Array(await file.arrayBuffer())
}

export function getObjectSize(obj: Record<string, any>) {
  return Buffer.byteLength(JSON.stringify(obj))
}
