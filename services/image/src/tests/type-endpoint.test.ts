import { expect, test } from 'vitest'

test('[head] ipfs - 200 - json', async () => {
  const res = await fetch(
    'https://image-beta.w.kodadot.xyz/type/endpoint/https://polkadot-data.s3.us-east-2.amazonaws.com/metadata/nfts-88/nfts-88_collection-meta.json',
    { method: 'HEAD' }
  )

  expect(res.ok).toBe(true)
  expect(res.status).toBe(200)
  expect(res.headers.get('content-type')).toBe('application/json')
})

test('[head] ipfs - 200 - image', async () => {
  const res = await fetch(
    'https://image-beta.w.kodadot.xyz/type/endpoint/https://polkadot-data.s3.us-east-2.amazonaws.com/metadata/nfts-88/nfts-88_collection-img.png',
    { method: 'HEAD', redirect: 'manual' }
  )

  expect(res.ok).toBe(true)
  expect(res.status).toBe(200)
  expect(res.headers.get('content-type')).toBe('image/png')
})

test('type-endpoint - 200 - json', async () => {
  const res = await fetch(
    'https://image-beta.w.kodadot.xyz/type/endpoint/https://polkadot-data.s3.us-east-2.amazonaws.com/metadata/nfts-88/nfts-88_collection-meta.json'
  )

  expect(res.ok).toBe(true)
  expect(res.status).toBe(200)
  expect(res.headers.get('content-type')).toBe('application/json')

  const data = await res.json()
  expect(data).toMatchInlineSnapshot(`
    {
      "description": "ASM Genesis Brains 🧠 Unique Artificial Intelligences owned via NFTs.Brains are capable of learning and evolving. They’re interoperable across different forms and worlds… powered by A.I, owned by you, and traded as an NFT.",
      "image": "https://polkadot-data.s3.us-east-2.amazonaws.com/metadata/nfts-88/nfts-88_collection-img.png",
      "license": "License name",
      "licenseUri": "https://license.com",
      "name": "ASM Brains",
      "tags": [
        "ASM",
        "paddi",
      ],
    }
  `)
})

test.only('type-endpoint - 302 - image', async () => {
  const res = await fetch(
    'https://image-beta.w.kodadot.xyz/type/endpoint/https://polkadot-data.s3.us-east-2.amazonaws.com/metadata/nfts-88/nfts-88_collection-img.png',
    { redirect: 'manual' }
  )

  expect(res.ok).toBe(true)
  expect(res.status).toBe(200)

  const redirectURL = res.headers.get('location')
  expect(redirectURL).toBe(null)
})

test('type-endpoint - 200 - image - original', async () => {
  const res = await fetch(
    'https://image-beta.w.kodadot.xyz/type/endpoint/https://polkadot-data.s3.us-east-2.amazonaws.com/metadata/nfts-88/nfts-88_collection-img.png?original=true'
  )

  expect(res.ok).toBe(true)
  expect(res.status).toBe(200)
  expect(res.headers.get('content-type')).toBe('image/png')

  const data = await res.blob()
  expect(data).toMatchInlineSnapshot(`
    Blob {
      Symbol(kHandle): Blob {},
      Symbol(kLength): 86670,
      Symbol(kType): "image/png",
    }
  `)
})

test('type-endpoint - 200 - html assets', async () => {
  const res = await fetch(
    'https://image-beta.w.kodadot.xyz/type/endpoint/https://arweave.net/JYh76DBFB1mvvpOS7jrKpOuJG2AFPt1NUp8-5Q9tMUY/index.html?&a=0x3c93690BBe585475FdfADaB3f59b4604008C7ac4&c=8453&tid=1&h=0xebee57cf2600aabca328750397f348b0fcb4e03449863c17c8305c887624ea4e&bh=0xfd6538c8182a8758bb52120ab0ee8820f4d1afc70f4dc1f0b52c9f7ff3e1bf18&bn=3656801&t=1694102949&wa=0x60B824cA6457330f923dd61cf14A011C3421BD6d&ms=1&mi=1&s=120&gp=0&gu=0'
  )

  expect(res.ok).toBe(true)
  expect(res.status).toBe(200)
  expect(res.headers.get('content-type')).toBe('text/html; charset=utf-8')
})
