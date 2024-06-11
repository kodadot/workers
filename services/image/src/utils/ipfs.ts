import {
  $purify,
  ipfsProviders,
  type HTTPS_URI,
  type IPFSProviders,
} from '@kodadot1/minipfs'

export function toIpfsGw(path: string, provider?: IPFSProviders) {
  const gw: IPFSProviders = provider || 'filebase_kodadot'
  const gateway = new URL(ipfsProviders[gw])
  const url = new URL(path)
  url.hostname = gateway.hostname

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
  console.log('gateway url', url)
  const response = await fetch(url, {
    signal: AbortSignal.timeout(2000),
  })
  console.log('fetch IPFS status', gateway, response.status)

  return response
}

export async function fetchIPFS({ path }: { path: string }) {
  console.log('ipfs path', path)

  const gateways: HTTPS_URI[] = [
    ipfsProviders.ipfs,
    ipfsProviders.filebase_kodadot,
  ]

  for (const gateway of gateways) {
    try {
      const response = await resolveGateway({ path, gateway })

      if (response.status === 200) {
        return {
          response: response,
          ok: true,
        }
      }
    } catch (error) {}
  }

  return {
    response: null,
    ok: false,
  }
}
