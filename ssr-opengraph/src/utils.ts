import { extendFields, getClient } from '@kodadot1/uniquery';
import { $purify } from '@kodadot1/minipfs';
import { formatBalance } from '@polkadot/util';
import { ofetch } from 'ofetch';

import type { Prefix } from '@kodadot1/static';
import type { NFT, NFTMeta } from './types';

export type Chains = 'rmrk' & Prefix;

const clientOf = (chain: Chains) => {
  const getChain = chain === 'rmrk' ? 'ksm' : chain;
  return getClient(getChain);
};

export const getNftById = async (chain: Chains, id: string) => {
  const client = clientOf(chain);
  const query = client.itemById(id, extendFields(['meta', 'price']));

  return await client.fetch(query);
};

export const getCollectionById = async (chain: Chains, id: string) => {
  const client = clientOf(chain);
  const query = client.collectionById(id, extendFields(['meta']));

  return await client.fetch(query);
};

export const getItemListByCollectionId = async (chain: Chains, id: string) => {
  const getChain = chain === 'rmrk' ? 'ksm' : chain;
  const client = getClient(getChain);
  const query = client.itemListByCollectionId(id);

  return await client.fetch(query);
};

export function ipfsToCdn(ipfs: string) {
  return $purify(ipfs, ['infura_dedicated_1'])[0];
}

export function jpegName(name: string) {
  const lowerCase = encodeURIComponent(name.trim());
  return `${lowerCase}.jpeg`;
}

export function formatPrice(price: string) {
  const number = BigInt(price);
  const format = formatBalance(number, {
    decimals: 12,
    withUnit: 'KSM',
    forceUnit: '-',
    withZero: false,
  });
  const value = format.toString();

  return value === '0' ? '' : value;
}

export async function getProperties(nft: NFT) {
  if (!nft.meta) {
    try {
      const response = await ofetch(ipfsToCdn(nft.metadata));
      const data = response as NFTMeta;

      return {
        name: data.name,
        description: data.description,
        title: `${data.name} | Low Carbon NFTs`,
        cdn: ipfsToCdn(data.image),
      };
    } catch (error) {
      console.log('Error', error);

      return {
        name: nft.name,
        description: '',
        title: `${nft.name} | Low Carbon NFTs`,
        cdn: 'https://kodadot.xyz/k_card.png',
      };
    }
  }

  const name = nft.name;
  const description = nft.meta?.description;
  const title = `${name} | Low Carbon NFTs`;
  const cdn = ipfsToCdn(nft.meta?.image);

  return {
    name,
    description,
    title,
    cdn,
  };
}
