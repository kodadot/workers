import { extendFields, getClient } from '@kodadot1/uniquery';
import { $purify } from '@kodadot1/minipfs';
import { formatBalance } from '@polkadot/util';
import { META_TITLE } from './constant';

import type { Prefix } from '@kodadot1/static';
import type { NFT, NFTMeta } from './types';

export const getItemListByIssuer = async (chain: Prefix, id: string) => {
  const client = getClient(chain);
  const query = client.itemListByIssuer(id);

  return await client.fetch(query);
};

export function ipfsToCdn(ipfs: string) {
  return $purify(ipfs, ['filebase_kodadot'])[0];
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

function formatImage(url: string) {
  if (url) {
    return ipfsToCdn(url);
  }

  return 'https://kodadot.xyz/k_card.png';
}

export async function getProperties(nft: NFT) {
  if (!nft?.meta || !nft?.name) {
    try {
      const response = await fetch(ipfsToCdn(nft?.metadata));
      const data = (await response.json()) as NFTMeta;

      return {
        name: data.name,
        description: data.description,
        title: `${data.name} | ${META_TITLE}`,
        cdn: formatImage(data.image),
      };
    } catch (error) {
      console.log('Error on getProperties()', error);
      const name = nft?.name || 'NFT Item';

      return {
        name: name,
        description: '',
        title: `${name} | ${META_TITLE}`,
        cdn: 'https://kodadot.xyz/k_card.png',
      };
    }
  }

  const name = nft.name;
  const description = nft.meta?.description;
  const title = `${name} | ${META_TITLE}`;
  const cdn = formatImage(nft.meta?.image);

  return {
    name,
    description,
    title,
    cdn,
  };
}

export const ogiRequest = async (reqUrl: string, rawHeaders: Headers) => {
  const url = new URL(reqUrl);
  const { pathname, search } = url;
  const opengraph = `https://workers-ogi.pages.dev${pathname}${search}`;

  const headers = new Headers(rawHeaders);
  const request = new Request(opengraph, {
    headers,
  });

  return await fetch(request);
};
