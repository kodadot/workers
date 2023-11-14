import type { Prefix } from '@kodadot1/static';
import type { Collection, BaseItem, NFT } from '@/utils/types';
import { getClient, extendFields } from '@kodadot1/uniquery';

export const prefixChain = (prefix: Prefix) => {
  const token: { [key: string]: string } = {
    ahk: 'kusama',
    ahp: 'polkadot',
    ksm: 'kusama',
    rmrk: 'kusama',
    bsx: 'kusama',
  };

  return token[prefix];
};

export const usdPrice = async (prefix: Prefix, amount: string) => {
  const id = prefixChain(prefix);
  const getUsd = await fetch(
    `https://price.preschian-cdn.workers.dev/price/${id}`,
  );
  const usd = await getUsd.json();
  const price = parseFloat(amount) * usd[id].usd;

  return price.toFixed(2);
};

export const getCollectionById = async (prefix: Prefix, id: string) => {
  const client = getClient(prefix);
  const query = client.collectionById(id, extendFields(['meta']));

  return (await client.fetch(query)) as unknown as Promise<{
    data: {
      collection: Collection;
    };
  }>;
};

export const getItemListByCollectionId = async (prefix: Prefix, id: string) => {
  const client = getClient(prefix);
  const query = client.itemListByCollectionId(id);

  return (await client.fetch(query)) as unknown as Promise<{
    data: {
      items: BaseItem[];
    };
  }>;
};

export const getNftById = async (prefix: Prefix, id: string) => {
  const client = getClient(prefix);
  const query = client.itemById(id, extendFields(['meta', 'price']));

  return (await client.fetch(query)) as unknown as Promise<{
    data: {
      item: NFT;
    };
  }>;
};
