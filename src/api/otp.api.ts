import { httpClient } from './httpClient';

export interface Setup2FAResponse {
  qrCode: string; // Base64 Data URL image
  secret: string; // Plaintext secret code
}

export interface Verify2FAResponse {
  success: boolean;
  message: string;
}

export interface OTPStatusResponse {
  employeeId?: string;
  has2FA: boolean;
  hasPersonalSecret: boolean;
  hasBranchAdminSecret: boolean;
  hasGlobalAdminSecret: boolean;
  is2FAAvailable: boolean;
}

// Setup 2FA - requires authenticated chain_admin
export function setup2FA() {
  return httpClient<Setup2FAResponse>('/otp/setup', {
    method: 'POST'
  });
}

// Verify 2FA code
export function verify2FA(code: string) {
  return httpClient<Verify2FAResponse>('/otp/verify', {
    method: 'POST',
    body: JSON.stringify({ code })
  });
}

// Check 2FA status for current user or a specific employee
export function get2FAStatus(employeeId?: string) {
  const query = employeeId ? `?employeeId=${encodeURIComponent(employeeId)}` : '';
  return httpClient<OTPStatusResponse>(`/otp/status${query}`, {
    method: 'GET'
  });
}

