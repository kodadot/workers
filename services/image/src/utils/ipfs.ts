import {
  $purify,
  getProviderList,
  ipfsProviders,
  type HTTPS_URI,
} from '@kodadot1/minipfs'

export function toIPFSDedicated(path: string) {
  const infura = new URL(getProviderList(['filebase_kodadot'])[0])
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

async function resolveGateway({ path = '', gateway = ipfsProviders.ipfs }) {
  const url = `${gateway}/ipfs/${path}`
  console.log('fetch IPFS status', gateway, url)
  const response = await fetch(url, {
    signal: AbortSignal.timeout(2000),
  })

  return response
}

export async function fetchIPFS({ path }: { path: string }) {
  console.log('ipfs path', path)

  const gateways: HTTPS_URI[] = [
    ipfsProviders.filebase_kodadot,
    ipfsProviders.ipfs,
    ipfsProviders.dweb,
  ]

  for (const gateway of gateways) {
    const response = await resolveGateway({ path, gateway })

    if (response.status === 200) {
      return {
        response: response,
        ok: true,
      }
    }
  }

  return {
    response: null,
    ok: false,
  }
}
