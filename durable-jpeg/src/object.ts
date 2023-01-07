import { KeyValue, KeyValueObject, KeyValueRequest, Optional, Value } from './types'
import isObjectEmpty from './isEmpty'
import headers from './header'

export class DurableJpeg {
  state: DurableObjectState

  constructor(state: DurableObjectState, env: Env) {
    this.state = state
  }

  // Handle HTTP requests from clients.
  async fetch(request: Request) {
    if (request.method === 'OPTIONS') {
      return new Response('OK', { status: 200, headers })
    }
    // Apply requested action.
    let url = new URL(request.url)
    switch (url.pathname) {
      case '/upload':
        return this.handleUpload(request)
      case '/batch':
        return this.handleBatch(request)
      case '/query':
        return this.handleQuery(request)
      case '/write':
        return this.handleWrite(request)
      case '/list':
          return this.handleList(request)
      default:
        return new Response('Method not allowed', { status: 405, headers })
    }
  }

  async handleUpload(request: Request): Promise<Response> {
    const { key, value } = await request.json<KeyValueRequest>()
    if (!(key && value)) {
      return new Response('Invalid request', { status: 400, headers })
    }

    this.state.storage?.put(key, value)
    return new Response('OK', { status: 200, headers })
  }

  async handleBatch(request: Request): Promise<Response> {
    const keys = await request.json<{ keys: string[] }>().then(({ keys }) => keys).catch(() => null)
    if (!keys && !Array.isArray(keys)) {
      return new Response('Missing keys', { status: 400, headers })
    }

    const values: string[] = keys.map(String).filter(Boolean)

    const result: Optional<KeyValue> = await this.state.storage?.get<Value>(
      values,
    )

    return new Response(JSON.stringify(Object.fromEntries(result || [])), { status: 200, headers })
  }

  async handleQuery(request: Request): Promise<Response> {
    const key = new URL(request.url).searchParams.get('key');
    if (!key) {
      return new Response('Missing key', { status: 400, headers})
    }
    const value: Optional<Value> = await this.state.storage?.get<Value>(key)
  
    return new Response(JSON.stringify({ [key]: value }), { status: 200, headers })
  }

  async handleWrite(request: Request) {
    const value = await request.json<KeyValueObject>()

    if (!value || isObjectEmpty(value)) {
      return new Response('Invalid request', { status: 400, headers })
    }

    await this.state.storage?.put(value)
    return new Response('OK', { status: 200, headers })
  }

  async handleList(_: Request): Promise<Response> {
    const keys: Map<string, Value> | undefined = await this.state.storage?.list<Value>()
    console.log(keys)
    const result = Array.from(keys || new Map())
    .map(([key, value]) => ({ key, value }))
    return new Response(JSON.stringify(result), { status: 200, headers: {...headers, 'Content-Type': 'application/json' } })
  }
  
}

interface Env {}
