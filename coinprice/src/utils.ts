export function cacheKey() {
  const date = new Date();
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();

  return `${year}-${month}-${day}`;
}

// return same format as coingecko https://api.coingecko.com/api/v3/simple/price?ids=kusama&vs_currencies=usd
export const formatPrice = (chain: string, price: string) => {
  return {
    [chain]: {
      usd: parseFloat(price),
    },
  };
};

export const chainToken = {
  kusama: 'KSM',
  polkadot: 'DOT',
  basilisk: 'BSX',
};

// get USD price from sub.id or kraken
export async function getPrice(
  chain: keyof typeof chainToken,
): Promise<string> {
  // fetch sub.id API
  const subid = await fetch('https://sub.id/api/v1/prices');
  if (subid.status === 200) {
    const data = await subid.json();
    const findToken = (data as { id: string; current_price: number }[]).find(
      (p) => p.id === chain,
    );
    const price = findToken?.current_price;
    return price ? price.toString() : '0';
  }

  // fetch kraken API
  const pair = `${chainToken[chain]}USD`;
  const kraken = await fetch(
    `https://api.kraken.com/0/public/Ticker?pair=${pair}`,
  );
  if (kraken.status === 200) {
    const data = (await kraken.json()) as {
      result: { [key: string]: { a: [string] } };
    };
    const price = data.result[pair].a[0];
    return price ? price.toString() : '0';
  }

  return '0';
}
