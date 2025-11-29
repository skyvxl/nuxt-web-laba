export interface Cart {
  id: string;
  userId: string;
  status: "active" | "ordered" | "canceled";
  totalItems: number;
  totalPrice: number;
  createdAt?: string;
  updatedAt?: string;
}
