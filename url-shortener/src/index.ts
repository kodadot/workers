import { Hono } from 'hono'
import { cache } from 'hono/cache'

type Bindings = {
  list: KVNamespace
}
const app = new Hono<{ Bindings: Bindings }>()

app.get('/', (c) => c.text('Hello World!'))

app.post('/', async (c) => {
  const body = await c.req.text()
  const { url, key } = JSON.parse(body)
  await c.env.list.put(key, url)
  return c.json({ key })
})

app.get('/:key', cache({
  cacheName: 'shorten',
  cacheControl: 'max-age=3600',
}), async (c) => {
  const key = c.req.param('key')
  const url = await c.env.list.get(key)
  return c.json({ url })
})

app.delete('/:key', async (c) => {
  const key = c.req.param('key')
  await c.env.list.delete(key)
  return c.json({ key })
})

export default app
