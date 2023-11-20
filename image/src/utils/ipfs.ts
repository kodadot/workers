type FetchIPFS = {
  path: string
  gateway1: string
  gateway2: string
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
