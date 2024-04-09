import {  toIPFSDedicated } from '../utils/ipfs'

const toExternalGateway = (url: string) => {
    const KODA_WORKERS = 'w.kodadot.xyz/ipfs/'
  
    return url.includes(KODA_WORKERS) ? toIPFSDedicated(url) : url
  }

export const getMimeType = async (url: string , routeType: 'metadata' | 'typeEndpoint' = 'metadata'): Promise<string> => {
    if (!url) {
      return ''
    }
  
    const externalUrl = ( routeType == 'metadata' ) ?  toExternalGateway(url) : url
    const data = await fetch(externalUrl, { method: 'HEAD' })
    const contentType = data.headers.get('content-type')
  
    if (data.status !== 200) {
      return await getMimeType(url , routeType)
    }
  
    return contentType ?? ''
  }