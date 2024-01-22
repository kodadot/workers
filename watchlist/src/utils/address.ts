import { decodeAddress, encodeAddress } from '@polkadot/util-crypto'

export function isValidAddress(address: string) {
  try {
    decodeAddress(address)
    return true
  } catch (e) {
    return false
  }
}

export function toSS58(address: string) {
  return encodeAddress(decodeAddress(address), 42)
}
