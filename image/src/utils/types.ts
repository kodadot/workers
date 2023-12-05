// refer to https://developers.cloudflare.com/api/operations/cloudflare-images-upload-an-image-via-url
export interface CFIApiResponse {
  errors: any[]
  messages: any[]
  result: {
    filename: string
    id: string
    meta: {
      key: string
    }
    requireSignedURLs: boolean
    uploaded: string
    variants: string[]
  } | null
  success: boolean
}

export type IPFSResponseType =
  | string
  | ArrayBuffer
  | Blob
  | ReadableStream<any>
  | ArrayBufferView
  | null
