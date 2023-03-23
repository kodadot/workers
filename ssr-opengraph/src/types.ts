export interface NFTMeta {
  id: string;
  name: string;
  description: string;
  image: string;
  animationUrl: string;
  type: null | string;
}

export interface NFT {
  id: string;
  createdAt: string;
  name: string;
  metadata: string;
  currentOwner: string;
  issuer: string;
  meta?: NFTMeta;
  price: string;
}

export interface NFTEntity {
  data: {
    item: NFT;
  };
}
