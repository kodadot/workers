import { expect, test } from 'vitest'

test('type-url - 200 - json', async () => {
  const res = await fetch(
    'https://image-beta.w.kodadot.xyz/type/url?endpoint=https://polkadot-data.s3.us-east-2.amazonaws.com/metadata/nfts-88/nfts-88_collection-meta.json'
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

test('type-url - 302 - image', async () => {
  const res = await fetch(
    'https://image-beta.w.kodadot.xyz/type/url?endpoint=https://polkadot-data.s3.us-east-2.amazonaws.com/metadata/nfts-88/nfts-88_collection-img.png',
    { redirect: 'manual' }
  )

  expect(res.ok).toBe(false)
  expect(res.status).toBe(302)

  const redirectURL = res.headers.get('location')
  expect(redirectURL).toBe(
    'https://imagedelivery.net/jk5b6spi_m_-9qC4VTnjpg/https---polkadot-data-s3-us-east-2-amazonaws-com-metadata-nfts-88-nfts-88-collection-img-png/public'
  )

  const res2 = await fetch(redirectURL)
  expect(res2.ok).toBe(true)
  expect(res2.headers.get('content-type')).toBe('image/png')

  const data = await res2.blob()
  expect(data).toMatchInlineSnapshot(`
    Blob {
      Symbol(kHandle): Blob {},
      Symbol(kLength): 86738,
      Symbol(kType): "image/png",
    }
  `)
})

test('type-url - 200 - image - original', async () => {
  const res = await fetch(
    'https://image-beta.w.kodadot.xyz/type/url?endpoint=https://polkadot-data.s3.us-east-2.amazonaws.com/metadata/nfts-88/nfts-88_collection-img.png?original=true'
  )

  expect(res.ok).toBe(true)
  expect(res.status).toBe(200)
  expect(res.headers.get('content-type')).toBe('image/png')

  const data = await res.blob()
  expect(data).toMatchInlineSnapshot(`
    Blob {
      Symbol(kHandle): Blob {},
      Symbol(kLength): 631349,
      Symbol(kType): "image/png",
    }
  `)
})
