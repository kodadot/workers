type BaseParams = {
  account: string
  token: string
}

type CFStream = BaseParams & {
  videoUrl: string
}

type CFStreamDownload = BaseParams & {
  videoUid: string
}

function parsePath(path: string) {
  const url = new URL(path)
  return url.pathname
}

export async function searchStream({ token, videoUrl, account }: CFStream) {
  const path = parsePath(videoUrl)
  const stream = new URL(
    `https://api.cloudflare.com/client/v4/accounts/${account}/stream`
  )
  stream.searchParams.append('search', path)

  const options = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  }

  try {
    const search = await fetch(stream.toString(), options)
    const response: any = await search.json()

    if (response.success && response.result.length) {
      return response.result[0]
    }

    return ''
  } catch (error) {
    console.log('error: search stream', error)

    return ''
  }
}

export async function downloadStream({
  token,
  videoUid,
  account,
}: CFStreamDownload) {
  try {
    const downloadApi = `https://api.cloudflare.com/client/v4/accounts/${account}/stream/${videoUid}/downloads`
    const download = await fetch(downloadApi, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      method: 'POST',
    })
    const response: any = await download.json()

    if (response.success) {
      return response.result
    }

    console.log('uploadStream', response.errors[0], videoUid)
    return ''
  } catch (error) {
    console.error('error: download from cf-stream', error)
    return ''
  }
}

export async function uploadStream({ token, videoUrl, account }: CFStream) {
  const path = parsePath(videoUrl)
  const expiryDate = new Date()
  expiryDate.setDate(expiryDate.getDate() + 30)

  try {
    const uploadVideo = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${account}/stream/copy`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          url: videoUrl,
          meta: {
            name: path,
          },
          scheduledDeletion: expiryDate,
        }),
      }
    )
    const response: any = await uploadVideo.json()

    if (response.success) {
      return response.result
    }

    console.log('uploadStream', response.errors[0], videoUrl)
    return ''
  } catch (error) {
    console.error('error: upload to cf-stream', error)
    return ''
  }
}
