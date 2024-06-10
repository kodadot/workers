import { blob, object } from 'valibot'

export type UploadImage = {
  file: File
}

export const uploadImageRequestSchema = object({
  file: blob('File is required'),
})
