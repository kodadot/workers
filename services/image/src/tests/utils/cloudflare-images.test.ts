import { expect, test } from 'vitest'
import { getCFIFlexibleVariant } from '../../utils/cloudflare-images'

test('utils getCFIFlexibleVariant', async () => {
  const url =
    'https://imagedelivery.net/jk5b6spi_m_-9qC4VTnjpg/bafybeiak6zlsmrhder2epl7qzxcpq6zqt6razp7wl66balp33nfno2fu7u/public'

  expect(getCFIFlexibleVariant({ w: '100' }, url).endsWith('/w=100')).toBe(true)
  expect(
    getCFIFlexibleVariant({ w: '100', blur: '50' }, url).endsWith(
      '/w=100,blur=50',
    ),
  ).toBe(true)
})
