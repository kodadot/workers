import { createThirdwebClient } from 'thirdweb'
import {
  base,
  optimism,
  avalanche,
  polygon,
  type ChainOptions,
} from 'thirdweb/chains'

export const chains: {
  [key: string]: Readonly<ChainOptions & { rpc: string }>
} = {
  base,
  optimism,
  avalanche,
  polygon,
}

export const thirdwebClient = createThirdwebClient({
  clientId: 'd0455344acaa6fb760281466980f3ec6',
})
