import { getContract } from 'thirdweb'
import { getContractMetadata } from 'thirdweb/extensions/common'
import { getNFTs, totalSupply } from 'thirdweb/extensions/erc721'
import { chains, ExtendedPrefix, thirdwebClient } from '~/server/utils/evm'

export default defineEventHandler(async (event) => {
  const { id: address, chain } = getRouterParams(event)
  const selectedChain = chains[chain as ExtendedPrefix]

  if (!selectedChain) {
    throw createError({
      statusCode: 404,
      message: 'Chain not found',
    })
  }

  const contract = getContract({
    client: thirdwebClient,
    chain: selectedChain,
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
  // set headers swr cache 5 minutes
  setHeader(event, 'Cache-Control', 'public, max-age=300, s-maxage=300, stale-while-revalidate=60')
  
  return {
    metadata,
    supply: supply.toString(),
    claimed: claimed.toString(),
    explorers: selectedChain.blockExplorers?.map(
      (explorer) => explorer.url + '/token/' + address,
    ),
  }
})
