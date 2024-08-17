import { getContract } from 'thirdweb'
import { getNFT, getNFTs, totalSupply } from 'thirdweb/extensions/erc721'
import { chains, ExtendedPrefix, thirdwebClient } from '~/server/utils/evm'

export default defineEventHandler(async (event) => {
  const { id: paramId, chain } = getRouterParams(event)
  const id = paramId.toString().split('-')
  const selectedChain = chains[chain as ExtendedPrefix]

  const address = id[0]
  const token = id[1] as unknown as bigint

  if (!selectedChain || !token || !address) {
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
  const [item, items, supply] = await Promise.all([
    getNFT({ contract, tokenId: token }),
    getNFTs({ contract, count: 10000 }).catch(() => []),
    totalSupply({ contract }).catch(() => 0),
  ])
  const claimed = items.filter((item) => item.tokenURI).length

  // set headers access-control-origin
  setHeader(event, 'Access-Control-Allow-Origin', '*')
  // set headers swr cache 5 minutes
  setHeader(event, 'Cache-Control', 'public, max-age=300, s-maxage=300, stale-while-revalidate=60')

  return {
    item,
    collection: {
      supply: supply.toString(),
      claimed: claimed.toString(),
    },
    explorers: selectedChain.blockExplorers?.map(
      (explorer) => explorer.url + '/token/' + address,
    ),
  }
})
