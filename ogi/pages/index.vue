<template>
  <div>
    <NuxtWelcome />
  </div>
</template>

<script lang="ts" setup>
const route = useRoute();

const { image, text } = route.query;

defineOgImage({
  component: 'base',
  text: text,
  image: image,
});
</script>
