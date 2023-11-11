<script setup lang="ts">
import type { CSSProperties } from 'vue';

// inherited attrs can mess up the satori parser
defineOptions({
  inheritAttrs: false,
})

defineProps<{
  title: string
  image: string
  items: string
  owners: string
  network: string
}>()

const cover: ComputedRef<CSSProperties> = computed(() => {
  return {
    objectFit: "cover",
    objectPosition: "center",
  }
})
</script>

<template>
  <img :src="image" :alt="title" :style="cover" class="h-full w-full">

  <div class="flex flex-col justify-end h-full w-full bg-slate-900/85 text-white p-10 text-2xl absolute inset-0">
    <img :src="image" :alt="title" class="w-30">
    <h1 class="mb-6">{{title}}</h1>
    <div class="flex flex-row">
      <div>
        <p>{{items}}</p>
        <p class="text-gray-400 mt-0">items</p>
      </div>

      <div class="ml-10">
        <p>{{owners}}</p>
        <p class="text-gray-400 mt-0">owners</p>
      </div>

      <div class="ml-10">
        <p>{{network}}</p>
        <p class="text-gray-400 mt-0">network</p>
      </div>
    </div>
  </div>

  <img src="https://raw.githubusercontent.com/kodadot/kodadot-presskit/main/pre-v4/png/KodalightV4.png" alt="logo" class="absolute top-10 right-10 w-40">
</template>

<style scoped>
h1 {
  font-size: 70px;
}
</style>
