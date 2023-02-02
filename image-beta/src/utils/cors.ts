import { ORIGIN } from './constants';

const MATCHES: RegExp[] = [
  /deploy-preview-[0-9]+--koda-nuxt.netlify.app/,
  /kodadot.xyz/,
  /localhost:9090/,
];

export const allowedOrigin = (origin: string): string | undefined | null => {
  const match = MATCHES.find((r) => r.test(origin));
  if (match) {
    return origin;
  }
  return ORIGIN;
};
