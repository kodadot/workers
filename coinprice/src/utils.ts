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
