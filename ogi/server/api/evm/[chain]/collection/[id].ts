import { getContract } from 'thirdweb'
import { getContractMetadata } from 'thirdweb/extensions/common'
import { getNFTs, totalSupply } from 'thirdweb/extensions/erc721'
import { chains, thirdwebClient } from '~/server/utils/evm'

export default defineEventHandler(async (event) => {
  const { id: address, chain } = getRouterParams(event)

  const contract = getContract({
    client: thirdwebClient,
    chain: chains[chain],
    address: address,
  })
  const [metadata, items, supply] = await Promise.all([
    getContractMetadata({ contract }),
    getNFTs({ contract, count: 10000 }).catch(() => []),
    totalSupply({ contract }).catch(() => 0),
  ])
  const claimed = items.filter((item) => item.tokenURI).length

  // set headers access-control-origin
  setHeader(event, 'Access-Control-Allow-Origin', '*')
  // set headers swr cache 1 minute
  setHeader(event, 'Cache-Control', 's-maxage=60, stale-while-revalidate')

  return {
    metadata,
    supply: supply.toString(),
    claimed: claimed.toString(),
    explorers: chains[chain].blockExplorers?.map(
      (explorer) => explorer.url + '/token/' + address,
    ),
  }
})
