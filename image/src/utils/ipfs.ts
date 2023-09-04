type FetchIPFS = {
  path: string;
  gateway1: string;
  gateway2: string;
};

export async function fetchIPFS({ path, gateway1, gateway2 }: FetchIPFS) {
  const gwCfIpfs = await fetch(`https://cloudflare-ipfs.com/ipfs/${path}`);
  console.log('fetch IPFS status', 'cloudflare-ipfs.com', gwCfIpfs.status);

  if (gwCfIpfs.status === 200) {
    return {
      headers: gwCfIpfs.headers,
      body: gwCfIpfs.body,
      ok: true,
    };
  }

  const gw1 = await fetch(`${gateway1}/ipfs/${path}`);
  console.log('fetch IPFS status', gateway1, gw1.status);

  if (gw1.status === 200) {
    return {
      headers: gw1.headers,
      body: gw1.body,
      ok: true,
    };
  }

  const gw2 = await fetch(`${gateway2}/ipfs/${path}`);
  console.log('fetch IPFS status', gateway2, gw2.status);

  if (gw2.status === 200) {
    return {
      headers: gw2.headers,
      body: gw2.body,
      ok: true,
    };
  }

  return {
    headers: null,
    body: null,
    ok: false,
  };
}
