import { expect, test } from 'vitest'

test.each([
  [
    'https://image-beta.w.kodadot.xyz/metadata?url=https://image-beta.w.kodadot.xyz/ipfs/bafkreia3j75r474kgxxmptwh5n43j5nrvn3du5l7dcfq2twh73wmagqs6m',
  ],
  [
    'https://image-beta.w.kodadot.xyz/metadata?url=https://cloudflare-ipfs.com/ipfs/bafkreia3j75r474kgxxmptwh5n43j5nrvn3du5l7dcfq2twh73wmagqs6m',
  ],
])('return json', async (url) => {
  const res = await fetch(url)

  expect(res.ok).toBe(true)
  expect(res.status).toBe(200)
  expect(res.headers.get('content-type')).toBe(
    'application/json; charset=UTF-8'
  )
})

test.each([
  [
    'https://image-beta.w.kodadot.xyz/metadata?url=https://polkadot-data.s3.us-east-2.amazonaws.com/metadata/nfts-88/nfts-88_collection-meta.json',
  ],
  [
    'https://image-beta.w.kodadot.xyz/metadata?url=https://image.w.kodadot.xyz/type/url?endpoint=https://polkadot-data.s3.us-east-2.amazonaws.com/metadata/nfts-88/nfts-88_collection-meta.json',
  ],
])('return json from non-ipfs', async (url) => {
  const res = await fetch(url)

  expect(res.ok).toBe(true)
  expect(res.status).toBe(200)
  expect(res.headers.get('content-type')).toBe(
    'application/json; charset=UTF-8'
  )
})

test.each([
  [
    'https://image-beta.w.kodadot.xyz/metadata?url=https://image-beta.w.kodadot.xyz/ipfs/bafybeihpbyskcjjhb5tnrjbsnsvzcfm2npjec3uf65n3o7stucta2rlos4',
    'https://image-beta.w.kodadot.xyz/ipfs/bafybeihpbyskcjjhb5tnrjbsnsvzcfm2npjec3uf65n3o7stucta2rlos4',
  ],
  [
    'https://image-beta.w.kodadot.xyz/metadata?url=https://cloudflare-ipfs.com/ipfs/bafybeihpbyskcjjhb5tnrjbsnsvzcfm2npjec3uf65n3o7stucta2rlos4',
    'https://cloudflare-ipfs.com/ipfs/bafybeihpbyskcjjhb5tnrjbsnsvzcfm2npjec3uf65n3o7stucta2rlos4',
  ],
])('redirect', async (url, redirectUrl) => {
  const res = await fetch(url, {
    redirect: 'manual',
  })

  expect(res.ok).toBe(false)
  expect(res.status).toBe(302)

  const location = res.headers.get('location')
  expect(location).toBe(redirectUrl)

  if (location) {
    const res2 = await fetch(location)
    expect(res2.ok).toBe(true)
    expect(res2.status).toBe(200)
    expect(res2.headers.get('content-type')).toBe('video/mp4')
  }
})

test.each([
  [
    'https://image-beta.w.kodadot.xyz/metadata?url=https://polkadot-data.s3.us-east-2.amazonaws.com/metadata/nfts-88/nfts-88_collection-img.png',
    'https://polkadot-data.s3.us-east-2.amazonaws.com/metadata/nfts-88/nfts-88_collection-img.png',
  ],
  [
    'https://image-beta.w.kodadot.xyz/metadata?url=https://image.w.kodadot.xyz/type/url?endpoint=https://polkadot-data.s3.us-east-2.amazonaws.com/metadata/nfts-88/nfts-88_collection-img.png',
    'https://image.w.kodadot.xyz/type/url?endpoint=https://polkadot-data.s3.us-east-2.amazonaws.com/metadata/nfts-88/nfts-88_collection-img.png',
  ],
])('redirect from non-ipfs', async (url, redirectUrl) => {
  const res = await fetch(url, {
    redirect: 'manual',
  })

  expect(res.ok).toBe(false)
  expect(res.status).toBe(302)

  const location = res.headers.get('location')
  expect(location).toBe(redirectUrl)

  if (location) {
    const res2 = await fetch(location)
    expect(res2.ok).toBe(true)
    expect(res2.status).toBe(200)
    expect(res2.headers.get('content-type')).toBe('image/png')
  }
})
