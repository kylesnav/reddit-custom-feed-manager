import { PKCECodeChallenge } from '@/types/auth';

function base64URLEncode(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}

function generateRandomString(length: number): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~';
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  return Array.from(array, byte => chars[byte % chars.length]).join('');
}

async function sha256(plain: string): Promise<ArrayBuffer> {
  const encoder = new TextEncoder();
  const data = encoder.encode(plain);
  return await crypto.subtle.digest('SHA-256', data);
}

export async function generatePKCEChallenge(): Promise<PKCECodeChallenge> {
  const code_verifier = generateRandomString(128);
  const hashed = await sha256(code_verifier);
  const code_challenge = base64URLEncode(hashed);

  return {
    code_verifier,
    code_challenge,
    code_challenge_method: 'S256',
  };
}

export function storePKCEVerifier(verifier: string): void {
  if (typeof window !== 'undefined') {
    sessionStorage.setItem('pkce_code_verifier', verifier);
  }
}

export function getPKCEVerifier(): string | null {
  if (typeof window !== 'undefined') {
    return sessionStorage.getItem('pkce_code_verifier');
  }
  return null;
}

export function clearPKCEVerifier(): void {
  if (typeof window !== 'undefined') {
    sessionStorage.removeItem('pkce_code_verifier');
  }
}