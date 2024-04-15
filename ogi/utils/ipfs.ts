import { $purifyOne } from '@kodadot1/minipfs'

export function ipfsUrl(ipfs: string) {
  return $purifyOne(ipfs, 'kodadot')
}
