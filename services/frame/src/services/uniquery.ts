import { extendFields, getClient } from '@kodadot1/uniquery'

export async function getCollection(chain: string, id: string) {
  const client = getClient(chain as any)
  const withImage = extendFields(['image', 'max' as any, 'supply'])
  const query = client.collectionById(id, withImage)

  console.log(JSON.stringify(query, null, 2))

  try {
    const result = await client.fetch<any>(query)
    return result.data?.collection
  } catch (error) {
    console.error(error)
    return null
  }
}

export async function getItemByOffset(
  chain: string,
  collection: string,
  offset: string | number
) {
  const client = getClient(chain as any);
  const query = client.itemListByCollectionId(collection, {
    limit: 1,
    offset: Number(offset),
    orderBy: "createdAt_ASC",
  });

  console.log(query);

  try {
    const result = await client.fetch<any>(query);
    return result.data?.items[0];
  } catch (error) {
    console.error(error);
    return null;
  }
}


export async function getItem(chain: string, collection: string, id: string) {
  const client = getClient(chain as any)
  // const withImage = extendFields(['image', 'max' as any])
  const final = `${collection}-${id}`
  const query = client.itemById(final)

  console.log(JSON.stringify(query, null, 2))

  try {
    const result = await client.fetch<any>(query)
    return result.data?.item
  } catch (error) {
    console.error(error)
    return null
  }
}
