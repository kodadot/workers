type CFStream = {
  token: string
  path: string
  account: string
}

export async function uploadStream({ token, path, account }: CFStream) {
  const url = `https://kodadot1.infura-ipfs.io/ipfs/${path}`
  const requestOptions = {
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

  try {
    const uploadVideo = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${account}/stream/copy`,
      requestOptions
    )
    const video: any = await uploadVideo.json()

    if (video.success) {
      console.log('video.result', video.result)
    } else {
      console.log('video', video)
      console.log('video.errors', video.errors[0])
      console.log(path)
    }

    return video.result
  } catch (error) {
    console.error('error: upload to cf-stream', error)
  }
}

export async function searchStream({ token, path, account }: CFStream) {
  const stream = new URL(
    `https://api.cloudflare.com/client/v4/accounts/${account}/stream`
  )
  stream.searchParams.append('search', path)
  stream.searchParams.append('status', 'ready')

  const options = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  }

  try {
    const search = await fetch(stream.toString(), options)
    const response: any = await search.json()

    if (response.success && response.result.length) {
      return response.result[0].preview
    }
  } catch (error) {
    console.log('error: search stream', error)

    return ''
  }
}
