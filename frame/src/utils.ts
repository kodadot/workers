export function kodaUrl(chain: string, collection: string, token?: string): string {
  const base = `https://kodadot.xyz/${chain}/`
  const path = token ? `gallery/${collection}-${token}` : `collection/${collection}`
  return base + path
}
