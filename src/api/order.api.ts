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
  discountAmount?: number;
  taxAmount?: number;
  orderType?: string;
  items: OrderItemPayload[];
}

export function createOrder(data: CreateOrderPayload) {
  return httpClient<any>('/orders', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export function getOrder(id: string) {
  return httpClient<any>(`/orders/${id}`, {
    method: 'GET',
  });
}

export type OrderStatus = 'paid' | 'pending' | 'cancelled' | 'refunded';

export interface UpdateOrderStatusPayload {
  status: OrderStatus;
}

export interface UpdateOrderStatusResponse {
  data: {
    order: {
      id: string;
      status: OrderStatus;
      customerId?: string | null;
      branchId: string;
    };
    invoice: {
      id: string;
      orderId: string;
      status: 'paid' | 'unpaid' | 'cancelled' | 'refunded';
      paymentStatus: 'pending' | 'completed' | 'failed' | 'refunded';
      totalAmount: number;
      pointsEarned?: number;
    } | null;
  };
}

/**
 * Updates the status of an order (e.g. cancelling it or marking it paid).
 * @param id The Order ID
 * @param status The new status ('paid', 'pending', 'cancelled', 'refunded')
 */
export function updateOrderStatus(id: string, status: OrderStatus) {
  return httpClient<UpdateOrderStatusResponse>(`/orders/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  });
}
