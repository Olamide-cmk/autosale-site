// ---------------------------------------------------------------------------
// Minimal ambient types for the subset of the Cloudflare D1 API used by this
// project. Kept local (instead of depending on @cloudflare/workers-types) so
// this project doesn't need a new dependency just for these few methods.
// For full type coverage of the Workers runtime, install
// `@cloudflare/workers-types` as a devDependency and add it to
// tsconfig.json's "types" array instead.
// ---------------------------------------------------------------------------

export interface D1PreparedStatement {
  bind(...values: unknown[]): D1PreparedStatement;
  run<T = unknown>(): Promise<{ success: boolean; results?: T[] }>;
  all<T = unknown>(): Promise<{ success: boolean; results: T[] }>;
  first<T = unknown>(): Promise<T | null>;
}

export interface D1Database {
  prepare(query: string): D1PreparedStatement;
  batch<T = unknown>(statements: D1PreparedStatement[]): Promise<{ success: boolean; results?: T[] }[]>;
}

/** The Cloudflare Workers bindings object for this Worker, as declared in
 * wrangler config (see vite.config.ts `nitro.cloudflare.wrangler`). Extend
 * this as more bindings (KV, R2, etc.) are added. */
export type CloudflareEnv = {
  DB?: D1Database;
};

/** Nitro's cloudflare-module preset stashes the current request's bindings
 * on `globalThis.__env__` for the duration of that request (see
 * node_modules/nitro/dist/presets/cloudflare/runtime/_module-handler.mjs).
 * Reading it here — rather than threading `env` through every function
 * call — keeps the store's call sites unchanged from the file-based
 * version. Note: since Workers can interleave requests within one isolate,
 * this global is technically shared for that window; for this app's access
 * patterns (single read/write per call, awaited immediately) that's safe in
 * practice, but don't rely on it across an `await` boundary spanning
 * unrelated requests. */
export function getD1(): D1Database | undefined {
  return (globalThis as { __env__?: CloudflareEnv }).__env__?.DB;
}
