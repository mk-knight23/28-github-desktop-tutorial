import type { NextConfig } from "next";

/**
 * Security headers per STANDARDS §8.
 *
 * CSP notes (documented exceptions):
 * - `script-src 'unsafe-inline'` is required for the pre-paint theme script and
 *   Next.js bootstrapping inline scripts. No `unsafe-eval` in production.
 * - GTM/GA domains are listed but the GTM script itself only loads after
 *   explicit consent (default declined) — see src/lib/analytics.ts.
 * - `connect-src https://api.github.com` is required by the public repo
 *   analyzer (unauthenticated, read-only public data).
 */
const CONTENT_SECURITY_POLICY = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' https://www.googletagmanager.com",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https://www.googletagmanager.com https://www.google-analytics.com",
  "font-src 'self'",
  "connect-src 'self' https://api.github.com https://www.googletagmanager.com https://www.google-analytics.com https://*.google-analytics.com",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "object-src 'none'",
  "upgrade-insecure-requests",
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: CONTENT_SECURITY_POLICY },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=()",
  },
  { key: "X-Frame-Options", value: "DENY" },
];

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
