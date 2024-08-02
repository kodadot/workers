import { createThirdwebClient, getContract } from 'thirdweb'
import { base } from 'thirdweb/chains'
import { getNFT, getNFTs, totalSupply } from 'thirdweb/extensions/erc721'

export default defineEventHandler(async (event) => {
  const { id: paramId } = getRouterParams(event)
  const id = paramId.toString().split('-')

  const address = id[0]
  const token = id[1] as unknown as bigint

  const client = createThirdwebClient({
    clientId: 'd0455344acaa6fb760281466980f3ec6',
  })
  const contract = getContract({
    client,
    chain: base,
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
      basecan: `https://basescan.org/token/${address}`
    },
  }
})
