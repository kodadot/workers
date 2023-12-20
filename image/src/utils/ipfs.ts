import { $purify, getProviderList } from '@kodadot1/minipfs'

type FetchIPFS = {
  path: string
  gateway1: string
  gateway2: string
}

export function toIPFSDedicated(path: string) {
  const infura = new URL(getProviderList(['infura_kodadot1'])[0])
  const url = new URL(path)
  url.hostname = infura.hostname

  return url.toString()
}

export function ipfsUrl(ipfs?: string) {
  if (!ipfs) {
    return ''
  }

  // TODO: 'kodadot_beta' for beta, 'kodadot' for prod
  return $purify(ipfs, ['kodadot_beta'])[0]
}

export async function fetchIPFS({ path, gateway1, gateway2 }: FetchIPFS) {
  console.log('ipfs path', path)

  const gwCfIpfs = await fetch(`https://cloudflare-ipfs.com/ipfs/${path}`)
  console.log('fetch IPFS status', 'cloudflare-ipfs.com', gwCfIpfs.status)

  if (gwCfIpfs.status === 200) {
    return {
      response: gwCfIpfs,
      ok: true,
    }
  }

  const gw1 = await fetch(`${gateway1}/ipfs/${path}`)
  console.log('fetch IPFS status', gateway1, gw1.status)

  if (gw1.status === 200) {
    return {
      response: gw1,
      ok: true,
    }
  }

  const gw2 = await fetch(`${gateway2}/ipfs/${path}`)
  console.log('fetch IPFS status', gateway2, gw2.status)

  if (gw2.status === 200) {
    return {
      response: gw2,
      ok: true,
    }
  }

  return {
    response: null,
    ok: false,
  }
}
