import { Buffer } from 'node:buffer'
import Hash from 'ipfs-only-hash'
import type { ImportContent } from 'ipfs-unixfs-importer'
import { CID } from 'multiformats'

export async function getUint8ArrayFromFile(file: File): Promise<Uint8Array> {
	return new Uint8Array(await file.arrayBuffer())
}

export function getObjectSize(obj: Record<string, unknown>) {
	return Buffer.byteLength(JSON.stringify(obj))
}

export async function hashOf(content: ImportContent | string): Promise<CID> {
	// note: generating the hash.of from cid v1 and then converting it to cid v0 generates a wrong cid with big file sizes
	return CID.parse(await Hash.of(content, { onlyHash: true, cidVersion: 0 }))
}

export function keyOf(cid: string) {
	return `ipfs/${cid}`
}
