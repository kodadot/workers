import { expect, test } from 'vitest'

test('ipfs - 200 - json', async () => {
  const res = await fetch(
    'https://image-beta.w.kodadot.xyz/ipfs/bafkreihy6xwb35imb5hfwxzgmw2p64yoefuxysh6bkghyjwaj7tz5sfnuq'
  )

  expect(res.ok).toBe(true)
  expect(res.status).toBe(200)
  expect(res.headers.get('content-type')).toBe('application/json')

  const data = await res.json()
  expect(data).toMatchInlineSnapshot(`
    {
      "animation_url": "",
      "attributes": [
        {
          "trait_type": "KodaForest",
          "value": "Carbonless",
        },
      ],
      "description": "Futuristic Building 2",
      "external_url": "https://kodadot.xyz",
      "image": "ipfs://ipfs/bafybeidv3wgydacgpre67lkciihrttvwl5nibzftxfppy6lfanjja4v7zm",
      "name": "Futuristic Building 2",
      "type": "image/jpeg",
    }
  `)
})

test('ipfs - 301 - image', async () => {
  const res = await fetch(
    'https://image-beta.w.kodadot.xyz/ipfs/bafybeidv3wgydacgpre67lkciihrttvwl5nibzftxfppy6lfanjja4v7zm',
    { redirect: 'manual' }
  )

  expect(res.ok).toBe(false)
  expect(res.status).toBe(301)

  const redirectURL = res.headers.get('location')
  expect(redirectURL).toBe(
    'https://imagedelivery.net/jk5b6spi_m_-9qC4VTnjpg/bafybeidv3wgydacgpre67lkciihrttvwl5nibzftxfppy6lfanjja4v7zm/public'
  )

  const res2 = await fetch(redirectURL)
  expect(res2.ok).toBe(true)
  expect(res2.headers.get('content-type')).toBe('image/jpeg')

  const data = await res2.blob()
  expect(data).toMatchInlineSnapshot(`
    Blob {
      Symbol(kHandle): Blob {},
      Symbol(kLength): 37937,
      Symbol(kType): "image/jpeg",
    }
  `)
})

test('ipfs - 200 - image - original', async () => {
  const res = await fetch(
    'https://image-beta.w.kodadot.xyz/ipfs/bafybeidv3wgydacgpre67lkciihrttvwl5nibzftxfppy6lfanjja4v7zm?original=true'
  )

  expect(res.ok).toBe(true)
  expect(res.status).toBe(200)
  expect(res.headers.get('content-type')).toBe('image/jpeg')

  const data = await res.blob()
  expect(data).toMatchInlineSnapshot(`
    Blob {
      Symbol(kHandle): Blob {},
      Symbol(kLength): 429556,
      Symbol(kType): "image/jpeg",
    }
  `)
})

test('ipfs - 301 - html', async () => {
  const res = await fetch(
    'https://image-beta.w.kodadot.xyz/ipfs/bafybeiakkzle3zsycvzpnkqtffqyq7njkt63vnmatkwijbg7kchq6s4she?hash=0x850b8f12e91fe48ad55cfb6bd8ee7b33adde24ebdf266ff8d23667c828c7e989',
    { redirect: 'manual' }
  )

  expect(res.ok).toBe(false)
  expect(res.status).toBe(301)

  const redirectURL = res.headers.get('location')
  expect(redirectURL).toBe(redirectURL)

  const res2 = await fetch(`https://image-beta.w.kodadot.xyz${redirectURL}`)
  expect(res2.ok).toBe(true)
  expect(res2.headers.get('content-type')).toBe('text/html')

  const data = await res2.blob()
  expect(data).toMatchInlineSnapshot(`
    Blob {
      Symbol(kHandle): Blob {},
      Symbol(kLength): 657,
      Symbol(kType): "text/html",
    }
  `)
})

test('ipfs - 200 - html', async () => {
  const res = await fetch(
    'https://image-beta.w.kodadot.xyz/ipfs/bafybeiakkzle3zsycvzpnkqtffqyq7njkt63vnmatkwijbg7kchq6s4she/?hash=0x850b8f12e91fe48ad55cfb6bd8ee7b33adde24ebdf266ff8d23667c828c7e989'
  )

  expect(res.ok).toBe(true)
  expect(res.status).toBe(200)
  expect(res.headers.get('content-type')).toBe('text/html')

  const data = await res.blob()
  expect(data).toMatchInlineSnapshot(`
    Blob {
      Symbol(kHandle): Blob {},
      Symbol(kLength): 657,
      Symbol(kType): "text/html",
    }
  `)
})
