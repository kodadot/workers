import { INDEXERS } from '@kodadot1/static';

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: false },
  modules: ['nuxt-og-image', 'nuxt-graphql-client'],

  runtimeConfig: {
    public: {
      'graphql-client': {
        clients: {
          default: INDEXERS.ahk,
          ahp: INDEXERS.ahp,
          rmrk: INDEXERS.rmrk,
          ksm: INDEXERS.ksm,
          bsx: INDEXERS.bsx,
          snek: INDEXERS.snek,
        },
      },
    },
  },
});
