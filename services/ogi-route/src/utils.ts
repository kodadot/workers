export const ogiRequest = async (reqUrl: string, rawHeaders: Headers) => {
  const url = new URL(reqUrl)
  const { pathname, search } = url
  const opengraph = `https://ogi.koda.art${pathname}${search}`
  console.log(url.toString())

  const headers = new Headers(rawHeaders)
  const request = new Request(opengraph, {
    headers,
  })

  return await fetch(request)
}
