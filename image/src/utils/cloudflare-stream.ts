type CFStream = {
  token: string
  path: string
  account: string
}

export async function searchStream({ token, path, account }: CFStream) {
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
  } catch (error) {
    console.log('error: search stream', error)

    return ''
  }
}

export async function downloadStream({ token, path, account }: CFStream) {
  try {
    const video = await searchStream({ token, path, account })

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

export async function uploadStream({ token, path, account }: CFStream) {
  const url = `https://kodadot1.infura-ipfs.io/ipfs/${path}`

  try {
    const search = await searchStream({ token, path, account })

    if (search?.readyToStream) {
      return search.preview
    }

    const uploadVideo = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${account}/stream/copy`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          url,
          meta: {
            name: path,
          },
        }),
      }
    )
    const video: any = await uploadVideo.json()

    return video.result
  } catch (error) {
    console.error('error: upload to cf-stream', error)
  }
}
