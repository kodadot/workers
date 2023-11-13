export function cacheKey() {
  const date = new Date();
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();

  return `${year}-${month}-${day}`;
}

export async function getPrices(): Promise<
  {
    id: string;
    current_price: number;
  }[]
> {
  return await fetch('https://sub.id/api/v1/prices').then((res) => res.json());
}

// return same format as coingecko https://api.coingecko.com/api/v3/simple/price?ids=kusama&vs_currencies=usd
export const formatPrice = (chain: string, price: string) => {
  return {
    [chain]: {
      usd: parseFloat(price),
    },
  };
};
