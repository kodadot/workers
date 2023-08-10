import { encodeAddress, isAddress } from '@polkadot/util-crypto';

export function addressOf(address: string): string {
  if (isAddress(address, undefined, 42)) {
    return address
  }

  return encodeAddress(address)
}