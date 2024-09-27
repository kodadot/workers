import { packToBlob } from 'ipfs-car/pack/blob'
import type { CID } from 'multiformats'

export default async function toCar(
	input: { path: string; content: Uint8Array }[],
) {
	const { root, car } = await packToBlob({
		input: input,
		wrapWithDirectory: true,
	})

	return {
		root: root as CID, // v1 CID
		car: car as Blob,
	}
}
