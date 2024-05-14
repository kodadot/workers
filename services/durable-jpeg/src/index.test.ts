import 'isomorphic-fetch'
import isObjectEmpty from './isEmpty'


test('empty object', () => {
  expect(isObjectEmpty({})).toBe(true)
  expect(isObjectEmpty({ a: 'a' })).toBe(false)
})

test('make sure test polyfills for fetch api work', () => {
  const url = "http://workers.cloudflare.com/"
  const req = new Request(url)
  expect(req.url).toBe(url)
})
