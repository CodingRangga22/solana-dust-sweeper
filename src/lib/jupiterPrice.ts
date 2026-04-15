const JUP_PRICE_URL = "https://api.jup.ag/price/v3/price";

type CacheEntry = { price: number | null; fetchedAt: number; inFlight?: Promise<number | null> };
const cache = new Map<string, CacheEntry>();
const TTL_MS = 30_000;

export async function getJupiterPriceUsd(mint: string): Promise<number | null> {
  const key = mint;
  const now = Date.now();
  const existing = cache.get(key);
  if (existing) {
    if (existing.inFlight) return existing.inFlight;
    if (now - existing.fetchedAt < TTL_MS) return existing.price;
  }

  const inFlight = (async () => {
    try {
      const url = `${JUP_PRICE_URL}?ids=${encodeURIComponent(mint)}`;
      const res = await fetch(url, { headers: { Accept: "application/json" } });
      if (!res.ok) return null;
      const data = (await res.json()) as { data?: Record<string, { price?: number }> };
      const p = data?.data?.[mint]?.price;
      return typeof p === "number" && Number.isFinite(p) ? p : null;
    } catch {
      return null;
    } finally {
      // Clear inFlight marker after resolution; keep cached price.
      const cur = cache.get(key);
      if (cur?.inFlight) cache.set(key, { price: cur.price ?? null, fetchedAt: cur.fetchedAt });
    }
  })();

  cache.set(key, { price: existing?.price ?? null, fetchedAt: existing?.fetchedAt ?? 0, inFlight });
  const price = await inFlight;
  cache.set(key, { price, fetchedAt: Date.now() });
  return price;
}

