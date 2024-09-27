// Patch: `ipfs-car` library has been patched to work with CID v0 which is not supported by the original implementation.
// see `import { pack } from 'ipfs-car/pack'`
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
		root: root as CID,
		car: car as Blob,
	}
}
