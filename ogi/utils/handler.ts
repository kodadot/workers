import type { Prefix } from '@kodadot1/static';
import type { Collection, BaseItem } from '@/utils/types';
import { getClient, extendFields } from '@kodadot1/uniquery';

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
