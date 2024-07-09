import { Buffer } from 'node:buffer'

export async function getUint8ArrayFromFile(file: File) {
  const arrayBuffer = await file.arrayBuffer()
  const buffer = Buffer.from(arrayBuffer)
  return Uint8Array.from(buffer)
}
