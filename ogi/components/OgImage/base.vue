<script setup lang="ts">
import type { CSSProperties } from 'vue'
import { KODA_LOGO_URL } from '@/utils/constants'
// inherited attrs can mess up the satori parser
defineOptions({
  inheritAttrs: false,
})

defineProps<{
  text?: string
  image?: string
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
    v-if="image"
    :src="image"
    :alt="text"
    :style="cover"
    class="h-full w-full"
  />

  <div
    class="flex flex-col justify-end h-full w-full bg-slate-900/75 text-white p-10 text-2xl font-bold absolute inset-0"
  >
    <img
      :src="KODA_LOGO_URL"
      alt="logo"
      class="absolute left-10 bottom-10 w-60"
    />

    <h1
      v-if="text"
      class="font-bold absolute right-10 bottom-10 m-0 rounded-lg px-4 py-1 bg-slate-900"
    >
      {{ text }}
    </h1>
  </div>
</template>
