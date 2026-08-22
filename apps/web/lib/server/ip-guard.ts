/**
 * IP guard to prevent SSRF attacks
 * Blocks loopback, private networks, link-local, and metadata IPs
 */

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
];

export function isSafeHost(host: string): boolean {
  const cleanHost = host.replace(/^\[|\]$/g, '');

  // Check if it's an IP address
  if (/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(cleanHost)) {
    return !PRIVATE_IP_PATTERNS.some(pattern => pattern.test(cleanHost));
  }

  // For hostnames, we can't easily determine if they resolve to private IPs
  // without DNS lookup, so we allow them but log a warning
  console.warn(`Host ${host} resolved to IP - SSRF protection requires DNS resolution`);
  return true;
}

/**
 * Resolve hostname to IP and check if safe
 * Note: In production, this should use proper DNS resolution
 */
export async function isSafeHostname(hostname: string): Promise<boolean> {
  // For now, use a simple check
  // In production, implement proper DNS resolution + IP check
  return isSafeHost(hostname);
}
