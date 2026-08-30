/**
 * IP guard to prevent SSRF attacks
 * Blocks loopback, private networks, link-local, and metadata IPs
 */

import { resolve4 as dnsResolve4 } from 'dns';
import { promisify } from 'util';

const dnsResolve4Async = promisify(dnsResolve4);

// Simple private IP detection without external dependency
const PRIVATE_IP_PATTERNS = [
  /^127\./,           // Loopback
  /^10\./,            // Private class A
  /^172\.(1[6-9]|2[0-9]|3[0-1])\./, // Private class B
  /^192\.168\./,      // Private class C
  /^169\.254\./,      // Link-local
  /^0\./,             // Current network
  /^::1$/,            // IPv6 loopback
  /^fe80:/i,          // IPv6 link-local
  /^fc00:/i,          // IPv6 unique local
  /^fd00:/i,          // IPv6 unique local
  /^100\.64\./,       // Carrier-grade NAT
];

/**
 * Check if an IP address is safe (not private/local)
 */
export function isSafeIP(ip: string): boolean {
  return !PRIVATE_IP_PATTERNS.some(pattern => pattern.test(ip));
}

/**
 * Check if a host is safe by resolving DNS and checking the IP
 */
export async function isSafeHost(host: string): Promise<boolean> {
  const cleanHost = host.replace(/^\[|\]$/g, '');

  // Check if it's an IP address directly
  if (/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(cleanHost)) {
    return isSafeIP(cleanHost);
  }

  // For hostnames, resolve and check
  try {
    const ips = await dnsResolve4Async(cleanHost);
    // If any resolved IP is private, consider it unsafe
    return !ips.some((ip: string) => !isSafeIP(ip));
  } catch {
    // DNS resolution failed, assume unsafe
    return false;
  }
}

/**
 * Validate host before connection
 * Throws if host is not safe
 */
export async function validateHost(host: string): Promise<void> {
  const safe = await isSafeHost(host);
  if (!safe) {
    throw new Error(`SECURITY: Host '${host}' resolved to a private/local IP address`);
  }
}
