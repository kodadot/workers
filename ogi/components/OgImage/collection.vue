<script setup lang="ts">
import { chainNames, type Prefix } from '@kodadot1/static';
import type { CSSProperties } from 'vue'
import { KODA_LOGO_URL } from '@/utils/constants'

// inherited attrs can mess up the satori parser
defineOptions({
  inheritAttrs: false,
})

const props = defineProps<{
  title: string
  image: string
  items: string
  // owners: string
  network: string
}>()

const cover: CSSProperties = {
  objectFit: 'cover',
  objectPosition: 'center',
}

const networkName = chainNames[props.network as Prefix]
</script>

<template>
  <img :src="image" :alt="title" :style="cover" class="h-full w-full" />

  <div
    class="flex flex-col justify-end h-full w-full bg-slate-900/85 text-white p-20 text-2xl font-bold absolute inset-0"
  >
    <img
      :src="image"
      :alt="title"
      class="w-30 rounded-md border border-white"
    />
    <h1 class="mb-6 font-bold">{{ title }}</h1>
    <div class="flex flex-row">
      <div>
        <div class="text-2xl font-bold m-0">{{ items }}</div>
        <div class="text-gray-400 m-0">items</div>
      </div>

      <!-- <div class="ml-16">
        <div class="text-2xl font-bold m-0">{{owners}}</div>
        <div class="text-gray-400 m-0">owners</div>
      </div> -->

      <div class="ml-16">
        <div class="text-2xl font-bold m-0">{{ networkName }}</div>
        <div class="text-gray-400 m-0">network</div>
      </div>
    </div>
  </div>

  <img
    :src="KODA_LOGO_URL"
    alt="logo"
    class="absolute top-10 right-10 w-40"
  />
</template>
