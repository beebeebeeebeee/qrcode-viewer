import { createDigest, createRandomBytes } from '@otplib/plugin-crypto-js';
import { keyDecoder, keyEncoder } from '@otplib/plugin-base32-enc-dec';
import {
  Authenticator,
  AuthenticatorOptions,
} from '@otplib/core';

export interface TotpData {
  secret: string;
  label?: string;
  issuer?: string;
}

/**
 * Parse a TOTP URI (otpauth://totp/...)
 * @param uri The TOTP URI to parse
 * @returns Parsed TOTP data or null if invalid
 */
export const parseTotpUri = (uri: string): TotpData | null => {
  try {
    if (!uri.startsWith('otpauth://totp/')) return null;

    const url = new URL(uri);
    const params = new URLSearchParams(url.search);
    const secret = params.get('secret');

    if (!secret) return null;

    const label = decodeURIComponent(url.pathname.substring(7)); // Remove /totp/
    const issuer = params.get('issuer') || undefined;

    return { secret, label, issuer };
  } catch (error) {
    console.error('Failed to parse TOTP URI:', error);
    return null;
  }
};

/**
 * Generate a TOTP code using the specified secret
 * @param secret The TOTP secret
 * @returns The generated TOTP code or null if generation fails
 */
export const generateTotpCode = (secret: string, next: boolean = false): string | null => {
  try {
    const authenticator = new Authenticator<AuthenticatorOptions>({
      createDigest,
      createRandomBytes,
      keyDecoder,
      keyEncoder
    });

    // Configure authenticator
    authenticator.options = {
      digits: 6,
      epoch: Date.now() + (next ? 30000 : 0),
    };

    return authenticator.generate(secret);
  } catch (error) {
    console.error('Failed to generate TOTP code:', error);
    return null;
  }
};

/**
 * Calculate the time remaining until the next TOTP code generation
 * @returns Seconds remaining until next code generation (0-29)
 */
export const getTimeRemaining = (): number => {
  return 30 - (Math.floor(Date.now() / 1000) % 30);
}; 