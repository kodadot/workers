<template>
  <div>
    <NuxtWelcome />
  </div>
</template>

<script lang="ts" setup>
defineOgImage({
  component: 'collection',
  title: 'Hello World Collections',
  image:
    'https://imagedelivery.net/jk5b6spi_m_-9qC4VTnjpg/bafkreiazqh2ba6vrqrtclb5rp4achww3xlo4whdpdu5ce43cdfrvzvokkq/public',
  items: '1,000,000',
  owners: '1,000',
  network: 'Solana',
});
</script>
