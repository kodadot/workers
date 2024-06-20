import { Hono } from 'hono'
import { isbot } from 'isbot'
import { ogiRequest } from './utils'

const app = new Hono()

app.get('/sandbox.html*', (c) => {
  return fetch('https://playground-r2.koda.art/sandbox.html')
})

app.get('/*', (c) => {
  const useragent = c.req.header('User-Agent')

  if (isbot(useragent)) {
    return ogiRequest(c.req.url, c.req.raw.headers)
  }

  return fetch(c.req.url)
})

export default app
