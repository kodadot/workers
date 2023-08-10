import { $fetch, FetchError } from 'ohmyfetch'

const BASE_URL = 'https://verifier.deno.dev'

const api = $fetch.create({
  baseURL: BASE_URL,
})

export type SignatureRequest = {
  address: string
  message: string
  signature: string
}

type SignatureResponse = {
  body: SignatureRequest
  valid: boolean
}




export const isSignatureValid = async (body: SignatureRequest) => {
  try {
    const res = await api<SignatureResponse>('/verify', {
      method: 'POST',
      body
    })
    return res
  } catch (error) {
    if (error instanceof FetchError) {
      console.error(error.response)
    }
  }
}
