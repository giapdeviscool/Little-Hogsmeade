import { httpClient } from './httpClient';

export interface DeliveryEmployee {
  id: string;
  name: string;
}

export interface DeliveryOrder {
  delivery_id: string;
  order_id: string;
  status: string;
  customer_name: string;
  customer_phone: string;
  delivery_address: string;
  total_amount_to_collect: number;
  delivery_employee: DeliveryEmployee | null;
  created_at: string;
}

export function getDeliveryOrders(status?: string) {
  const query = status ? `?status=${status}` : '';
  return httpClient<{ success: boolean; data: DeliveryOrder[] }>(`/delivery/orders${query}`);
}

export function assignShipper(deliveryId: string, employeeId: string) {
  return httpClient<any>(`/delivery/orders/${deliveryId}/assign`, {
    method: 'PUT',
    body: JSON.stringify({ delivery_employee_id: employeeId })
  });
}

export function updateDeliveryStatus(deliveryId: string, status: string, note?: string) {
  return httpClient<any>(`/delivery/orders/${deliveryId}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status, note })
  });
}

export function getEmployees() {
  return httpClient<any>('/employees?limit=100');
}

export function createDeliveryOrder(data: any) {
  return httpClient<any>('/pos/orders/delivery', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}
