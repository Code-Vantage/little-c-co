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
  customizationType?: string;
};

export type OptionChoice = {
  value: string;
  label: string;
  priceDelta?: number;
};

// showIf: render this field only when option `optionId`'s value matches `equals`.
export type OptionCondition = {
  optionId: string;
  equals: string | string[];
};

export type SelectOption = {
  kind: "select" | "radio";
  id: string;
  label: string;
  help?: string;
  required?: boolean;
  // Provide exactly one of `options` (flat), `groups` (bucketed), or a dependent list.
  options?: OptionChoice[];
  groups?: Array<{ label: string; options: OptionChoice[] }>;
  // Dependent list: options depend on another option's currently selected value.
  dependsOn?: string;
  optionsByParent?: Record<string, OptionChoice[]>;
  showIf?: OptionCondition;
};

export type TextOption = {
  kind: "text" | "textarea";
  id: string;
  label: string;
  help?: string;
  placeholder?: string;
  required?: boolean;
  maxLength?: number;
  showIf?: OptionCondition;
};

export type QuantityOption = {
  kind: "quantity";
  id: string;
  label: string;
  min?: number;
  max?: number;
};

export type FileOption = {
  kind: "file";
  id: string;
  label: string;
  help?: string;
  accept?: string;
  maxSizeMB?: number;
  showIf?: OptionCondition;
};

export type ProductOption = SelectOption | TextOption | QuantityOption | FileOption;

export type ProductOptionSchema = {
  type: string;
  title: string;
  options: ProductOption[];
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

// Canonical address shape shared between the account profile API and checkout.
// Field names match WooCommerce's billing/shipping REST shape directly.
export type Address = {
  first_name: string;
  last_name: string;
  company?: string;
  address_1: string;
  address_2?: string;
  city: string;
  state: string;
  postcode: string;
  country: string;
  email?: string;
  phone?: string;
};
