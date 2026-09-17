export interface Product {
  id: string;
  name: string;
  variant: string;
  price: number;
  image: string;
  category: string;
  inStock: boolean;
  tags?: string[];
  badges?: string[];
  badge?: string;
}

export type ProductCategoryOption = {
  value: string;
  label: string;
};
