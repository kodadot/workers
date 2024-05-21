function isObjectEmpty(object: Record<string, string>) {
  for (const _ in object) {
    return false
  }
  return true
}

export default isObjectEmpty
