import { createThirdwebClient, getContract } from 'thirdweb'
import {
  base,
  optimism,
  avalanche,
  polygon,
  type ChainOptions,
} from 'thirdweb/chains'
import { getNFT, getNFTs, totalSupply } from 'thirdweb/extensions/erc721'

// evm chains
const chains: { [key: string]: Readonly<ChainOptions & { rpc: string }> } = {
  base,
  optimism,
  avalanche,
  polygon,
}

export default defineEventHandler(async (event) => {
  const { id: paramId, chain } = getRouterParams(event)
  const id = paramId.toString().split('-')

  const address = id[0]
  const token = id[1] as unknown as bigint

  const client = createThirdwebClient({
    clientId: 'd0455344acaa6fb760281466980f3ec6',
  })
  const contract = getContract({
    client,
    chain: chains[chain],
    address: address,
  })
  const [item, items, supply] = await Promise.all([
    getNFT({ contract, tokenId: token }),
    getNFTs({ contract, count: 1000 }),
    totalSupply({ contract }),
  ])
  const claimed = items.filter((item) => item.tokenURI).length

  return {
    item,
    collection: {
      supply: supply.toString(),
      claimed: claimed.toString(),
    },
    explorers: chains[chain].blockExplorers?.map(explorer => explorer.url + '/token/' + address),
  }
})
