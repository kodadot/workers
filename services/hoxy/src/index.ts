import { Hono } from 'hono'
// import { proxy } from 'hono/proxy'

const app = new Hono<{ Bindings: CloudflareBindings }>()

app.get('*', async (c) => {
  return await c.env.IMAGE.fetch(c.req.raw)
})

export default app