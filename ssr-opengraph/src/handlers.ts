import type { Prefix } from '@kodadot1/static';
import type { CollectionEntity, ListEntity, NFTEntity } from './types';
import {
  formatPrice,
  getCollectionById,
  getItemListByCollectionId,
  getItemListByIssuer,
  getNftById,
  getProperties,
  jpegName,
} from './utils';
import { META_TITLE } from './constant';

export const galleryDetail = async (chain: string, id: string) => {
  const response = await getNftById(chain as Prefix, id);
  const data = response as NFTEntity;
  const { item } = data.data;

  const canonical = `https://kodadot.xyz/${chain}/gallery/${id}`;
  const { name, description, title, cdn } = await getProperties(item);

  // contruct price
  const price = formatPrice(item.price || '0');

  // construct vercel image with cdn
  const image = new URL(
    `https://og-image-green-seven.vercel.app/${jpegName(name)}`
  );
  image.searchParams.set('price', price);
  image.searchParams.set('image', cdn);

  return {
    name: `${chain} ${id}`,
    siteData: {
      title,
      description: description,
      canonical,
      image: image.toString(),
    },
  };
};

export const collectionDetail = async (chain: string, id: string) => {
  const [collectionItem, nfts] = await Promise.all([
    getCollectionById(chain as Prefix, id),
    getItemListByCollectionId(chain as Prefix, id),
  ]);
  const { collection } = (collectionItem as CollectionEntity).data;

  const canonical = `https://kodadot.xyz/${chain}/collection/${id}`;
  const { name, description, title, cdn } = await getProperties(collection);

  const price = (nfts as ListEntity).data.items.length || 0;

  // construct vercel image with cdn
  const image = new URL(
    `https://og-image-green-seven.vercel.app/${jpegName(name)}`
  );
  image.searchParams.set('price', `Items: ${price}`);
  image.searchParams.set('image', cdn);

  return {
    name: `${chain} ${id}`,
    siteData: {
      title,
      description: description,
      canonical,
      image: image.toString(),
    },
  };
};

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
