import { createThirdwebClient, defineChain } from 'thirdweb'
import {
  base,
  optimism,
  avalanche,
  polygon,
  type Chain,
} from 'thirdweb/chains'
import type { Prefix } from '@kodadot1/static'

const imx = defineChain({
  id: 13371,
  name: 'Immutable zkEVM',
  nativeCurrency: {
    name: 'IMX',
    symbol: 'IMX',
    decimals: 18,
  },
  explorers: [
    {
      name: 'Immutable explorer',
      url: 'https://explorer.immutable.com',
      standard: 'EIP3091',
    },
  ],
})

const mantle = defineChain({
  id: 5000,
  name: 'Mantle',
  nativeCurrency: {
    name: 'Mantle',
    symbol: 'MNT',
    decimals: 18,
  },
  explorers: [
    {
      name: 'Mantle Explorer',
      url: 'https://explorer.mantle.xyz',
      standard: 'EIP3091',
    },
    {
      name: 'Mantle Explorer',
      url: 'https://mantlescan.xyz/',
      standard: 'EIP3091',
    },
  ],
})

type SelectedPrefix = Extract<Prefix, 'base' | 'imx'>
export type ExtendedPrefix =
  | SelectedPrefix
  | 'optimism'
  | 'avalanche'
  | 'polygon'
  | 'mantle'

export const chains: Record<ExtendedPrefix, Chain> = {
  base,
  optimism,
  avalanche,
  polygon,
  imx,
  mantle,
}

export const thirdwebClient = createThirdwebClient({
  clientId: 'd0455344acaa6fb760281466980f3ec6',
})
