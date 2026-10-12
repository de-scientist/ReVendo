/**
 * Server-side API client foundation (Phase 1).
 *
 * Boundary rules (binding):
 * - Only import this module from Server Components, Server Actions, or Route Handlers.
 * - Never import it from Client Components — it carries no secrets itself, but
 *   keeps the base-URL + cookie-forwarding discipline in one audited place.
 * - Browser code must never call Prisma/MySQL directly or read session cookies
 *   beyond what the server explicitly exposes.
 * - Auth cookies are HTTP-only; the browser never sees session identifiers.
 */

const API_BASE = (process.env.API_BASE_URL ?? 'http://localhost:3001/api/v1').replace(/\/$/, '');

export function apiUrl(path: string): string {
  const suffix = path.startsWith('/') ? path : `/${path}`;
  return `${API_BASE}${suffix}`;
}

export type ApiFetchOptions = RequestInit & { revalidateSeconds?: number };

export async function apiGet<T>(path: string, init?: ApiFetchOptions): Promise<T> {
  const { revalidateSeconds, ...rest } = init ?? {};
  const res = await fetch(apiUrl(path), {
    ...rest,
    method: 'GET',
    next: revalidateSeconds !== undefined ? { revalidate: revalidateSeconds } : undefined,
  });
  if (!res.ok) {
    throw new ApiClientError(`API request failed: ${res.status}`, res.status, path);
  }
  return (await res.json()) as T;
}

export class ApiClientError extends Error {
  readonly status: number;
  readonly path: string;
  constructor(message: string, status: number, path: string) {
    super(message);
    this.name = 'ApiClientError';
    this.status = status;
    this.path = path;
  }
}

export type HealthResponse = {
  status: 'ok';
  service: 'revendo-api';
  version: string;
  timestamp: string;
};

export function isApiOnline(err: unknown): boolean {
  return err instanceof ApiClientError && err.status < 500;
}
