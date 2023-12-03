// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: false },
  modules: ['nuxt-og-image'],

  // It would cause request error without setting [ssr: false] https://stackoverflow.com/questions/74884488/nuxt-3-usefetch-returns-the-error-fetch-failed
  ssr: false,
})
