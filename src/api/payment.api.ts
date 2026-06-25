import { httpClient } from './httpClient';

export interface QrIntentPayload {
  invoice_id: string;
  amount: number;
}

export interface QrIntentResponse {
  data: {
    qrCodeUrl: string;
    transactionRef: string;
  };
}

export function getQrIntent(data: QrIntentPayload) {
  return httpClient<QrIntentResponse>('/payments/qr-intent', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export interface CashSettlePayload {
  invoice_id: string;
  cash_received: number;
}

export function settleCashPayment(data: CashSettlePayload) {
  return httpClient<any>('/payments/cash-settle', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}
