export interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  oldPrice?: number;
  image: string;
  shortDescription: string;
  description: string;
  characteristics: Record<string, string>;
  features: string[];
}
