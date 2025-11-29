export interface CartItem {
  id: string;
  cartId: string;
  productId: string;
  quantity: number;
  fixedPrice: number;
  addedAt?: string;
  // Optional snapshot fields so the cart displays correctly even if product is removed
  productName?: string;
  productImage?: string;
}
