type Value = string
type KeyValue = Map<string, Value>
type Optional<T> = T | undefined

export class DurableJpeg {
  state: DurableObjectState

  constructor(state: DurableObjectState, env: Env) {
    this.state = state
  }

  // Handle HTTP requests from clients.
  async fetch(request: Request) {
    // Apply requested action.
    let url = new URL(request.url)
    switch (url.pathname) {
      case '/upload':
        return this.handleUpload(request)
      case '/batch':
        return this.handleBatch(request)
      case '/query':
        return this.handleQuery(request)
        // Just serve the current value. No storage calls needed!
        break
      default:
        return new Response('Method not allowed', { status: 405 })
    }
  }

  async handleUpload(request: Request): Promise<Response> {
    const { key, value } = await request.json()
    if (!(key && value)) {
      return new Response('Invalid request', { status: 400 })
    }

    this.state.storage?.put(key, value)
    return new Response('OK')
  }

  async handleBatch(request: Request): Promise<Response> {
    const { keys } = await request.json()
    if (!keys && !Array.isArray(keys)) {
      return new Response('Missing keys', { status: 400 })
    }

    const values: string[] = keys.map(String).filter(Boolean)

    const result: Optional<KeyValue> = await this.state.storage?.get<Value>(
      values,
    )

    return new Response(JSON.stringify(Object.fromEntries(result || [])))
  }

  async handleQuery(request: Request): Promise<Response> {
    const key = new URL(request.url).searchParams.get('key');
    if (!key) {
      return new Response('Missing key', { status: 400 })
    }
    const value: Optional<Value> = await this.state.storage?.get<Value>(key)
  
    return new Response(JSON.stringify({ [key]: value }), { status: 200 })
  }
  
}

interface Env {}
