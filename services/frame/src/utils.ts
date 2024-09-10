export function kodaUrl(chain: string, collection: string, token?: string): string {
  const base = `https://koda.art/${chain}/`
  const col = collection.toLowerCase()
  const path = token ? `gallery/${col}-${token}` : `collection/${col}`
  return base + path
}
