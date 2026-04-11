/**
 * Privy may wrap `globalThis.fetch` so outbound requests run through auth hooks.
 * Calling `getAccessToken()` while that hook runs another `fetch` can recurse until stack overflow.
 * Capture the native `fetch` before any `@privy-io/react-auth` import runs (see `main.tsx` import order).
 */
const g = globalThis as typeof globalThis & { __ARSWEEP_NATIVE_FETCH__?: typeof fetch };

if (g.__ARSWEEP_NATIVE_FETCH__ === undefined) {
  g.__ARSWEEP_NATIVE_FETCH__ = g.fetch.bind(g);
}

export function getNativeFetch(): typeof fetch {
  return g.__ARSWEEP_NATIVE_FETCH__ ?? g.fetch.bind(g);
}
