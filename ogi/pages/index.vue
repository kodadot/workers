<template>
  <div></div>
</template>

<script lang="ts" setup>
const route = useRoute()

const { image, text } = route.query

defineOgImage({
  component: 'base-image',
  props: {
    image: KODA_BANNER_URL,
  },
})

useSeoMeta({
  title: seoTitle('Koda'),
  description: KODA_DESCRIPTION,
  twitterCard: 'summary_large_image',
})
</script>
