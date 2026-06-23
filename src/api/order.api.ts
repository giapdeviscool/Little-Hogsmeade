import { httpClient } from './httpClient';

export interface OrderItemPayload {
  menuItemId: string;
  unitPrice: number;
  quantity: number;
  subtotal?: number;
  toppings?: { toppingId: string; quantity: number; extraPrice: number }[];
}

export interface CreateOrderPayload {
  branchId: string;
  customerId?: string | null;
  status?: string; // defaults to "paid" on backend
  paymentMethod: string;
  discountAmount?: number;
  taxAmount?: number;
  items: OrderItemPayload[];
}

export function createOrder(data: CreateOrderPayload) {
  return httpClient<any>('/orders', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}
