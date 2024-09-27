import { MemoryBlockStore } from 'ipfs-car/blockstore/memory'
import { pack } from 'ipfs-car/pack'
import type { CID } from 'multiformats'

export default async function toCar(
	input: { path: string; content: Uint8Array }[],
) {
	const { root, out } = await pack({
		input: input,
		blockstore: new MemoryBlockStore(),
		wrapWithDirectory: true,
	})

	const chunks = []
	for await (const chunk of out) {
		chunks.push(chunk)
	}

	const car = new Uint8Array(
		chunks.reduce((acc, chunk) => acc.concat(Array.from(chunk)), []),
	)

	return {
		root: root as CID,
		car,
	}
}
