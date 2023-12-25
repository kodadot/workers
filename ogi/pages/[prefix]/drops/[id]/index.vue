<template>
  <div>
    <h1>{{ collection.name }}</h1>
    <img :src="ipfsUrl(collection?.meta?.image)" :alt="collection.name" />

    <hr />
    <p>debug:</p>
    <div>{{ collection }}</div>
    <div>{{ drop }}</div>
  </div>
</template>

<script lang="ts" setup>
import type { Prefix } from '@kodadot1/static'

const route = useRoute()

const prefix = route.params.prefix.toString() as Prefix
const id = route.params.id.toString()

const drop = await getDropById(id)

const {
  data: { collection },
} = await getCollectionById(prefix, drop.collection)

defineOgImage({
  component: 'drops',
  title: collection.name,
  image: ipfsUrl(drop.image),
  items: String(collection.max),
})

useSeoMeta({
  title: seoTitle(collection.name),
  description: collection.meta?.description,
  ogTitle: seoTitle(collection.name),
  ogDescription: collection.meta?.description,
  ogType: 'website',
  twitterCard: 'summary_large_image',
  twitterTitle: seoTitle(collection.name),
  twitterImageAlt: collection.name,
})
</script>
