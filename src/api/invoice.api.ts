import { httpClient } from './httpClient';

export interface InvoiceListResponse {
  success: boolean;
  data: any[];
  pagination: {
    totalRecords: number;
    currentPage: number;
    totalPages: number;
    limit: number;
  };
}

export function listInvoices(params: Record<string, any> = {}) {
  const query = new URLSearchParams();
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      query.append(key, String(value));
    }
  });

  const queryString = query.toString();
  const endpoint = queryString ? `/invoices?${queryString}` : '/invoices';

  return httpClient<InvoiceListResponse>(endpoint, {
    method: 'GET',
  });
}

export function getInvoice(id: string) {
  return httpClient<any>(`/invoices/${id}`, {
    method: 'GET',
  });
}
