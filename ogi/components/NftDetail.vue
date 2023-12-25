<template>
  <div>
    <h1>title: {{ name }}</h1>
    <p>image: {{ image }}</p>
    <p>price: {{ price }} {{ symbol }}</p>
    <p>usd: {{ usd }}</p>
    <p>network: {{ network }}</p>
    <img :src="ipfsUrl(image)" :alt="name" />
    <div>{{ item }}</div>
  </div>
</template>

<script lang="ts" setup>
import { formatBalance } from '@polkadot/util'
import { chainNames, type Prefix, CHAINS } from '@kodadot1/static'
import { getNftById } from '@/utils/handler'

const route = useRoute()
const { prefix, id } = route.params
const chain = prefix.toString() as Prefix
const network = chainNames[prefix as Prefix]

const {
  data: { item },
} = await getNftById(chain, id.toString())

const name = item.name
const description = item.meta.description
const image = item.meta.image

const chains = CHAINS[chain]
const decimals = chains.tokenDecimals
const symbol = chains.tokenSymbol
const price = formatBalance(item.price, {
  decimals: decimals,
  withUnit: symbol,
  withSi: false,
  forceUnit: symbol,
})
const usd = await usdPrice(chain, price)

defineOgImage({
  component: 'gallery',
  title: name,
  image: ipfsUrl(image || 'https://kodadot.xyz/k_card.png'),
  usd,
  price,
  symbol,
  network,
})

useSeoMeta({
  title: seoTitle(name),
  description: description,
  ogTitle: seoTitle(name),
  ogDescription: description,
  ogType: 'website',
  twitterCard: 'summary_large_image',
  twitterTitle: seoTitle(name),
  twitterImageAlt: name,
})
</script>
