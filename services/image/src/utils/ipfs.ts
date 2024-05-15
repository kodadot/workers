import {
  $purify,
  getProviderList,
  ipfsProviders,
  type HTTPS_URI,
} from '@kodadot1/minipfs'

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

async function resolveGateway({
  path = '',
  gateway = ipfsProviders.infura_kodadot1,
}) {
  const response = await fetch(`${gateway}/ipfs/${path}`)
  console.log('fetch IPFS status', gateway, response.status)

  return response
}

export async function fetchIPFS({ path }: { path: string }) {
  console.log('ipfs path', path)

  const gateways: HTTPS_URI[] = [
    ipfsProviders.apillon,
    ipfsProviders.ipfs,
    ipfsProviders.dweb,
    ipfsProviders.cloudflare,
    ipfsProviders.filebase_kodadot,
    ipfsProviders.infura_kodadot1,
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
