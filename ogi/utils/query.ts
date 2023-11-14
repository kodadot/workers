import { type Prefix } from '@kodadot1/static';

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
  const getUsd = await fetch(`https://price.kodadot.workers.dev/price/${id}`);
  const usd = await getUsd.json();
  const price = parseFloat(amount) * usd[id].usd;

  return price.toFixed(2);
};

export const getNft = async (prefix: Prefix, id: string) => {
  switch (prefix) {
    case 'ahk':
      return await GqlNftById_ahk({ id });
    case 'ahp':
      return await GqlNftById_ahp({ id });
    case 'ksm':
      return await GqlNftById_ksm({ id });
    case 'rmrk':
      return await GqlNftById_rmrk({ id });
    case 'bsx':
      return await GqlNftById_bsx({ id });
    default:
      break;
  }
};
