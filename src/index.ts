// In order for the workers runtime to find the class that implements
// our Durable Object namespace, we must export it from the root module.
export { DurableJpeg } from './object'

export default {
  async fetch(request: Request, env: Env) {
    try {
      return await handleRequest(request, env)
    } catch (e) {
      return new Response(`${e}`)
    }
  },
}

async function handleRequest(request: Request, env: Env) {
  let id = env.JPEG.idFromName('HYPER')
  let obj = env.JPEG.get(id)
  return await obj.fetch(request)
}

interface Env {
  JPEG: DurableObjectNamespace
}
