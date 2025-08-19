export const ORIGIN = 'https://kodadot.xyz'

const MATCHES: RegExp[] = [
  /deploy-preview-[0-9]+--nuxt-kodadot.netlify.app/,
  /deploy-preview-[0-9]+--koda-nuxt.netlify.app/,
  /deploy-preview-[0-9]+--koda-canary.netlify.app/,
  /deploy-preview-[0-9]+--polkadot.netlify.app/,
  /deploy-preview-[0-9]+--koda-beta.netlify.app/,
  /kodaart-production.pages.dev/,
  /kodadot.xyz/,
  /koda.art/,
  /app-bzd.pages.dev/,
  /chaotic-art.vercel.app/,
  /ff.chaotic.art/,
  /localhost:9090/,
]

export const allowedOrigin = (origin: string): string | undefined | null => {
  const match = MATCHES.find((r) => r.test(origin))
  if (match) {
    return origin
  }
  return ORIGIN
}

export const encodeEndpoint = (endpoint: string) => {
  return endpoint.replace(/[^a-zA-Z0-9]/g, '-')
}
