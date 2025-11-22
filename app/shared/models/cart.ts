export interface CartItemSnapshot {
  productId: string;
  name?: string;
  image?: string;
  fixedPrice: number;
}

export interface Cart {
  id: string;
  userId: string;
  status: "active" | "ordered" | "canceled";
  totalItems: number;
  totalPrice: number;
  createdAt?: string;
  updatedAt?: string;
}
