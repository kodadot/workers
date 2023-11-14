import { type Prefix } from '@kodadot1/static';

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
