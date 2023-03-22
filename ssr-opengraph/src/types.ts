export interface NFTMeta {
  name: string;
  image: string;
  animationUrl: string;
  description: string;
  id: string;
}

export interface NFT {
  id: string;
  name: string;
  price: string;
  metadata: string;
  meta?: NFTMeta;
}

export interface NFTEntity {
  data: {
    nftEntityById: NFT;
  };
}
