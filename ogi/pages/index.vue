<template>
  <div></div>
</template>

<script lang="ts" setup>
useSeoMeta({
  title: seoTitle('Koda'),
  viewport: 'width=device-width, initial-scale=1',
  description: KODA_DESCRIPTION,
  ogTitle: seoTitle('Koda'),
  ogDescription: KODA_DESCRIPTION,
  ogType: 'website',
  ogImage: KODA_BANNER_URL,
  twitterCard: 'summary_large_image',
  twitterTitle: seoTitle('Koda'),
  twitterDescription: KODA_DESCRIPTION,
  twitterImage: KODA_BANNER_URL,
  twitterSite: '@KodaDot'
})
</script>
