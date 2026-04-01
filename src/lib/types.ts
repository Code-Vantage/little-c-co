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
  id: number;
  name: string;
  slug: string;
  price: number;
  quantity: number;
  image: string;
};

export type CheckoutPayload = {
  customerId?: number;
  billing: {
    first_name: string;
    last_name: string;
    email: string;
    phone?: string;
    address_1: string;
    city: string;
    state: string;
    postcode: string;
    country: string;
  };
  shipping: {
    first_name: string;
    last_name: string;
    address_1: string;
    city: string;
    state: string;
    postcode: string;
    country: string;
  };
  line_items: Array<{
    product_id: number;
    quantity: number;
  }>;
};
