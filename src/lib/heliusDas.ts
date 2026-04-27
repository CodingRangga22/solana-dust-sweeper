import { NETWORK } from "@/config/env";
import type { TokenMetadata } from "@/lib/tokenAccounts";

const cache = new Map<string, TokenMetadata>();

export function heliusRpcUrl(): string | null {
  const apiKey =
    import.meta.env.VITE_HELIUS_API_KEY ??
    import.meta.env.VITE_HELIUS_RPC_URL?.split("api-key=")[1] ??
    "";
  if (!apiKey) return null;
  const heliusCluster = NETWORK === "devnet" ? "devnet" : "mainnet";
  return `https://${heliusCluster}.helius-rpc.com/?api-key=${apiKey}`;
}

export type HeliusAsset = {
  id?: string;
  mutable?: boolean;
  authorities?: Array<{ address?: string; scopes?: string[] }>;
  ownership?: { owner?: string };
  content?: { metadata?: { name?: string; symbol?: string } };
};

export async function fetchHeliusAsset(mint: string): Promise<HeliusAsset | null> {
  const url = heliusRpcUrl();
  if (!url) return null;
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: "1",
        method: "getAsset",
        params: { id: mint },
      }),
    });
    const json = await res.json();
    return (json?.result ?? null) as HeliusAsset | null;
  } catch {
    return null;
  }
}

function fallbackMeta(mint: string): TokenMetadata {
  return {
    name: `${mint.slice(0, 4)}...${mint.slice(-4)}`,
    symbol: mint.slice(0, 6),
    logoURI: null,
  };
}

export async function fetchHeliusTokenMetadata(mint: string): Promise<TokenMetadata> {
  const cached = cache.get(mint);
  if (cached) return cached;

  const url = heliusRpcUrl();
  if (!url) {
    const fb = fallbackMeta(mint);
    cache.set(mint, fb);
    return fb;
  }

  try {
    const result = await fetchHeliusAsset(mint);
    const metadata = result?.content?.metadata;
    const links = result?.content?.links;
    const meta: TokenMetadata = {
      name: metadata?.name || fallbackMeta(mint).name,
      symbol: metadata?.symbol || fallbackMeta(mint).symbol,
      logoURI: links?.image || null,
    };
    cache.set(mint, meta);
    return meta;
  } catch {
    const fb = fallbackMeta(mint);
    cache.set(mint, fb);
    return fb;
  }
}

export async function fetchHeliusTokenMetadataBatch(mints: string[]): Promise<Record<string, TokenMetadata>> {
  const unique = [...new Set(mints)].filter(Boolean);
  const out: Record<string, TokenMetadata> = {};
  const missing: string[] = [];

  for (const m of unique) {
    const c = cache.get(m);
    if (c) out[m] = c;
    else missing.push(m);
  }

  // Simple concurrency-limited fanout (DAS doesn't provide getAssetBatch on all plans).
  const CONCURRENCY = 6;
  for (let i = 0; i < missing.length; i += CONCURRENCY) {
    const slice = missing.slice(i, i + CONCURRENCY);
    const metas = await Promise.all(slice.map((m) => fetchHeliusTokenMetadata(m)));
    metas.forEach((meta, idx) => {
      out[slice[idx]] = meta;
    });
  }

  return out;
}

