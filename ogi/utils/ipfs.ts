import { $purify } from '@kodadot1/minipfs'

export function ipfsUrl(ipfs: string) {
  return $purify(ipfs, ['kodadot'])[0]
}
