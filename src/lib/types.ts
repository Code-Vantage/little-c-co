export type StoreImage = {
  src: string;
  alt: string;
};

export type StoreAttribute = {
  name: string;
  options: string[];
};

export type StoreProduct = {
  id: number;
  name: string;
  slug: string;
  description: string;
  shortDescription: string;
  price: string;
  regularPrice: string;
  stockStatus: string;
  images: StoreImage[];
  categories: string[];
  attributes?: StoreAttribute[];
};

export type CartLine = {
  key?: string;
  id: number;
  name: string;
  slug: string;
  price: number;
  quantity: number;
  image: string;
  customizations?: Array<{
    key: string;
    value: string;
  }>;
};
