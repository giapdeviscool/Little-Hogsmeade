import { env } from '../config/env';
import { getAuthToken } from '../store/auth.store';
import axios from 'axios';

export interface ValidateVoucherPayload {
  code: string;
  orderSubtotal: number;
  customerId?: string | null;
}

export const validateVoucherApi = async (payload: ValidateVoucherPayload) => {
  const token = getAuthToken();
  try {
    const res = await axios.post(`${env.apiBaseUrl}/vouchers/validate`, payload, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return res.data;
  } catch (error: any) {
    throw error.response?.data || error;
  }
};

export const getCustomerVouchersApi = async (customerId: string) => {
  const token = getAuthToken();
  try {
    const res = await axios.get(`${env.apiBaseUrl}/vouchers/customer/${customerId}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return res.data;
  } catch (error: any) {
    throw error.response?.data || error;
  }
};
