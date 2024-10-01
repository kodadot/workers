<script setup lang="ts">
import type { CSSProperties } from 'vue'
import { KODA_LOGO_URL } from '@/utils/constants'

// inherited attrs can mess up the satori parser
defineOptions({
  inheritAttrs: false,
})

defineProps<{
  image: string
}>()

const cover: ComputedRef<CSSProperties> = computed(() => {
  return {
    objectFit: 'cover',
    objectPosition: 'center',
  }
})
</script>

<template>
  <img
    :src="image"
    :alt="text"
    :style="cover"
    class="h-full w-full"
  />
</template>
