<template>
  <div>
    <h1>{{ collection.name }}</h1>
    <p>collection page</p>
    <div>{{ collection }}</div>
    <img :src="ipfsUrl(collection.meta.image)" :alt="collection.name">
  </div>
</template>

<script lang="ts" setup>
import type {Prefix} from '@kodadot1/static'

const route = useRoute()

const prefix = route.params.prefix.toString() as Prefix
const id = route.params.id.toString()

const {data: {collection}} = await getCollectionById(prefix, id)
const {data: {items}} = await getItemListByCollectionId(prefix, id)

console.log(collection, items.length)

useSeoMeta({
  title: collection.name,
  description: collection.meta.description,
  ogTitle: collection.name,
  ogDescription: collection.meta.description,
  ogType: 'website',
  twitterCard: 'summary_large_image',
})

defineOgImage({
  component: 'collection',
  title: collection.name,
  image: ipfsUrl(collection.meta.image),
  items: items.length.toString(),
  network: prefix,
})
</script>
