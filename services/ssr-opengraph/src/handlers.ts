import type { Prefix } from '@kodadot1/static';
import type { ListEntity } from './types';
import {
  getItemListByIssuer,
  getProperties,
  jpegName,
} from './utils';
import { META_TITLE } from './constant';

export const userDetail = async (chain: string, id: string) => {
  const response = await getItemListByIssuer(chain as Prefix, id);
  const data = response as ListEntity;
  const { items } = data.data;

  const canonical = `https://kodadot.xyz/${chain}/gallery/${id}`;
  const { description, cdn } = await getProperties(items[0]);

  // total created nfts
  const created = items.length;

  // construct vercel image with cdn
  const image = new URL(
    `https://og-image-green-seven.vercel.app/${jpegName(id)}`
  );
  image.searchParams.set('price', `Created: ${created}`);
  image.searchParams.set('image', cdn);

  return {
    name: `${chain} ${id}`,
    siteData: {
      title: `NFT Artist Profile on KodaDot | ${META_TITLE}`,
      description,
      canonical,
      image: image.toString(),
    },
  };
};
