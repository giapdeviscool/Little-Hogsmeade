import { httpClient } from './httpClient';

export interface Setup2FAResponse {
  qrCode: string; // Base64 Data URL image
  secret: string; // Plaintext secret code
}

export interface Verify2FAResponse {
  success: boolean;
}

// Setup 2FA - requires authenticated chain_admin
export function setup2FA() {
  return httpClient<Setup2FAResponse>('/otp/setup', {
    method: 'GET'
  });
}

// Verify 2FA code
export function verify2FA(code: string) {
  return httpClient<Verify2FAResponse>('/otp/verify', {
    method: 'POST',
    body: JSON.stringify({ code })
  });
}
