<script setup lang="ts">
import type { CSSProperties } from 'vue'
import { KODA_LOGO_URL } from '@/utils/constants'

// inherited attrs can mess up the satori parser
defineOptions({
  inheritAttrs: false,
})

defineProps<{
  title: string
  image: string
}>()

const cover: CSSProperties = {
  objectFit: 'cover',
  objectPosition: 'center',
}
</script>

<template>
  <img :src="image" :alt="title" :style="cover" class="h-full w-full" />

  <div
    class="flex flex-col h-full w-full bg-slate-900/90 text-white p-20 absolute inset-0"
  >
    <h1 class="mb-6 font-bold text-6xl">
      {{ title }}
    </h1>
  </div>

  <img
    :src="KODA_LOGO_URL"
    alt="logo"
    class="w-60 absolute right-20 bottom-20"
  />
</template>
