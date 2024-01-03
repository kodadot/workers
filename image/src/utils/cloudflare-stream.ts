type CFStream = {
  token: string
  videoUrl: string
  account: string
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

export async function downloadStream({ token, videoUrl, account }: CFStream) {
  try {
    const video = await searchStream({ token, videoUrl, account })

    if (!video?.uid) {
      return ''
    }

    const downloadApi = `https://api.cloudflare.com/client/v4/accounts/${account}/stream/${video.uid}/downloads`
    const download = await fetch(downloadApi, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    const response: any = await download.json()

    if (response.success && response.result?.default?.percentComplete === 100) {
      return response.result.default.url
    }

    return ''
  } catch (error) {
    console.error('error: download from cf-stream', error)
    return ''
  }
}

export async function uploadStream({ token, videoUrl, account }: CFStream) {
  const path = parsePath(videoUrl)

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
        }),
      }
    )
    const video: any = await uploadVideo.json()

    if (video.success) {
      return video.result
    }

    console.log('uploadStream', video.errors[0], videoUrl)
    return ''
  } catch (error) {
    console.error('error: upload to cf-stream', error)
    return ''
  }
}
