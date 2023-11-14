<template>
  <div>
    <h1>title: {{ name }}</h1>
    <p>image: {{ image }}</p>
    <p>price: {{ price }} {{ symbol }}</p>
    <p>network: {{ network }}</p>
    {{ data }}
  </div>
</template>

<script lang="ts" setup>
import { formatBalance } from '@polkadot/util';
import { NAMES, type Prefix, CHAINS } from '@kodadot1/static';

const route = useRoute();
const { prefix, id } = route.params;
const chain = prefix.toString() as Prefix;
const network = NAMES[prefix as Prefix];

const data = await getNft(chain, id.toString());

const name = data?.nftEntityById?.name || '';
const image = data?.nftEntityById?.meta?.image;

const chains = CHAINS[chain];
const decimals = chains.tokenDecimals;
const symbol = chains.tokenSymbol;
const price = formatBalance(data?.nftEntityById?.price, {
  decimals: decimals,
  withUnit: symbol,
  withSi: false,
  forceUnit: symbol,
});

defineOgImage({
  component: 'gallery',
  title: name,
  image: ipfsUrl(image || 'https://kodadot.xyz/k_card.png'),
  price: price + ' ' + symbol,
  network,
});
</script>
