import { encodeEndpoint } from '../routes/type-endpoint'
import { CFIApiResponse } from './types'

type CFImages = {
  token: string
  imageAccount: string
}

type UploadCFI = CFImages & {
  url: string
  id: string
}

async function resizeImage(url: string) {
  const wsrvnl = new URL('https://wsrv.nl')
  wsrvnl.searchParams.append('url', url)
  wsrvnl.searchParams.append('w', '1400')

  console.log(wsrvnl.toString())

  // trigger resize
  await fetch(wsrvnl.toString(), { method: 'HEAD' })

  return wsrvnl.toString()
}

async function uploadCFI({ token, url, id, imageAccount }: UploadCFI) {
  const uploadHeaders = new Headers()
  uploadHeaders.append('Authorization', `Bearer ${token}`)

  const uploadFormData = new FormData()
  uploadFormData.append('url', url)
  uploadFormData.append('id', id)

  const requestOptions = {
    method: 'POST',
    headers: uploadHeaders,
    body: uploadFormData,
    redirect: 'follow',
  }

  const uploadCfImage = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${imageAccount}/images/v1`,
    requestOptions
  )
  const image = (await uploadCfImage.json()) as CFIApiResponse

  console.log('uploadStatus', image.success)

  if (image.success) {
    // current variants = ['/detail', '/public', '/aaa']
    // return `https://imagedelivery.net/${imageId}/${id}/public`;
    // return image.result?.variants?.[1];
    return image.result?.variants?.find((v) => v.endsWith('/public'))
  }

  return ''
}

type IpfsToCFI = CFImages & {
  gateway: string
  path: string
}

export async function ipfsToCFI({
  token,
  gateway,
  path,
  imageAccount,
}: IpfsToCFI) {
  const imageOnIpfs = `${gateway}/ipfs/${path}`
  const url = await resizeImage(imageOnIpfs)

  return await uploadCFI({
    token,
    url,
    id: path,
    imageAccount,
  })
}

type UrlToCFI = CFImages & {
  endpoint: string
}

export async function urlToCFI({ token, endpoint, imageAccount }: UrlToCFI) {
  const path = encodeEndpoint(endpoint)
  const url = await resizeImage(endpoint)

  return await uploadCFI({
    token,
    url,
    id: path,
    imageAccount,
  })
}

export async function getImageByPath({
  token,
  imageAccount,
  path,
}: CFImages & { path: string }) {
  const getImage = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${imageAccount}/images/v1/${path}`,
    {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    }
  )
  const image = (await getImage.json()) as CFIApiResponse

  if (getImage.ok && image.result) {
    const variants = image.result.variants
    const publicURL = variants.find((url) => url.endsWith('/public'))

    if (publicURL) {
      return publicURL
    }
  }

  return ''
}
