import { createArsweepFetchWithPayment, type ArsweepX402SigningWallet } from "@/lib/arsweepX402Client";
import { fetchHeliusAsset } from "@/lib/heliusDas";

function defaultSyraBase(): string {
  // Prefer same-origin proxy to avoid CORS limitations around x402 headers.
  // In dev, Vite proxies /syra → https://api.syraa.fun (see vite.config.ts).
  // In prod, you should provide an equivalent reverse proxy (e.g. your API/server) at /syra.
  return "/syra";
}

const SYRA_API_BASE = (import.meta.env.VITE_SYRA_API_BASE?.trim() || defaultSyraBase()).replace(/\/$/, "");

export type SyraRiskLevel = "safe" | "caution" | "high" | "unknown";

export type SyraTokenRisk = {
  mint: string;
  level: SyraRiskLevel;
  reason: string;
  source: "syra";
  fetchedAt: number;
  onchain?: {
    name?: string | null;
    symbol?: string | null;
    image?: string | null;
    mutable?: boolean;
    updateAuthority?: string | null;
  };
  raw?: unknown;
};

function extractFirstString(raw: unknown): string {
  if (raw == null) return "";
  if (typeof raw === "string") return raw;
  if (typeof raw !== "object") return "";

  // Common API patterns
  const obj = raw as Record<string, unknown>;
  const directKeys = ["response", "answer", "message", "result", "output", "text", "content"];
  for (const k of directKeys) {
    const v = obj[k];
    if (typeof v === "string") return v;
  }

  // Nested: { data: { ... } } or { data: "..." }
  const data = obj.data;
  if (typeof data === "string") return data;
  if (data && typeof data === "object") {
    const inner = extractFirstString(data);
    if (inner) return inner;
  }

  // Nested: { choices: [{ message: { content: "..." } }] } (LLM-style)
  const choices = obj.choices;
  if (Array.isArray(choices) && choices.length > 0) {
    for (const c of choices) {
      const t = extractFirstString(c);
      if (t) return t;
      const msg = (c as any)?.message;
      const t2 = extractFirstString(msg);
      if (t2) return t2;
    }
  }

  return "";
}

function parseExplicitVerdict(text: string): { level: SyraRiskLevel; reason: string } | null {
  const t = text.trim();
  if (!t) return null;
  const upper = t.toUpperCase();

  // Try to find explicit tokens anywhere in the response
  const hasHigh = /\b(HIGH\s*RISK|HIGH-RISK|RUG|SCAM|HONEYPOT|MALICIOUS)\b/i.test(t);
  const hasCaution = /\b(CAUTION|WARNING|RISKY|SUSPICIOUS)\b/i.test(t);
  const hasSafe = /\b(SAFE|TRUSTED|VERIFIED)\b/i.test(t);
  const hasUnknown = /\bUNKNOWN\b/i.test(t);

  // Prefer explicit "HIGH RISK" then caution then safe; unknown only if nothing else
  if (/\bHIGH\s*RISK\b/i.test(t) || (hasHigh && !hasSafe)) return { level: "high", reason: "Syra verdict: HIGH RISK" };
  if (/\bCAUTION\b/i.test(t) || hasCaution) return { level: "caution", reason: "Syra verdict: CAUTION" };
  if (/\bSAFE\b/i.test(t) || hasSafe) return { level: "safe", reason: "Syra verdict: SAFE" };
  if (hasUnknown || upper.includes("UNKNOWN")) return { level: "unknown", reason: "Syra verdict: UNKNOWN" };
  return null;
}

function textIncludesAny(haystack: string, needles: string[]): boolean {
  const h = haystack.toLowerCase();
  return needles.some((n) => h.includes(n.toLowerCase()));
}

function deriveRiskFromUnknownJson(raw: unknown): { level: SyraRiskLevel; reason: string } {
  if (raw == null) return { level: "unknown", reason: "No data" };
  if (typeof raw === "string") {
    if (textIncludesAny(raw, ["scam", "honeypot", "malicious", "rug", "phishing"])) {
      return { level: "high", reason: "Flagged as suspicious" };
    }
    return { level: "unknown", reason: "Unrecognized response" };
  }

  const str = (() => {
    try {
      return JSON.stringify(raw);
    } catch {
      return "";
    }
  })();

  // Heuristic mapping so we don't tightly couple to Syra's response schema.
  if (textIncludesAny(str, ["honeypot", "phishing", "scam", "malicious", "drainer", "blacklist"])) {
    return { level: "high", reason: "High-risk indicators found" };
  }
  if (textIncludesAny(str, ["warn", "warning", "caution", "risky", "suspicious"])) {
    return { level: "caution", reason: "Potential risk indicators found" };
  }
  if (textIncludesAny(str, ["safe", "trusted", "verified", "ok"])) {
    return { level: "safe", reason: "No major risk indicators" };
  }
  return { level: "unknown", reason: "No clear risk verdict" };
}

async function readJsonOrText(res: Response): Promise<unknown> {
  const text = await res.text();
  if (!text) return {};
  try {
    return JSON.parse(text);
  } catch {
    return { raw: text };
  }
}

export function buildSyraTokenRiskQuestion(mint: string): string {
  return (
    `Give a concise security/risk summary for Solana token mint ${mint}. ` +
    `Classify as SAFE / CAUTION / HIGH RISK and give 1 short reason. ` +
    `If unsure, say UNKNOWN.`
  );
}

export async function fetchSyraTokenRisk(
  wallet: ArsweepX402SigningWallet,
  mint: string,
): Promise<SyraTokenRisk> {
  const fetchPay = createArsweepFetchWithPayment(wallet);
  const onchain = await (async () => {
    const asset = await fetchHeliusAsset(mint);
    if (!asset) return undefined;
    // Best-effort: Helius DAS authorities; for tokens this is usually metadata update authority.
    const updateAuthority = asset.authorities?.[0]?.address ?? null;
    const name = (asset as any)?.content?.metadata?.name ?? null;
    const symbol = (asset as any)?.content?.metadata?.symbol ?? null;
    const image = (asset as any)?.content?.links?.image ?? null;
    return { name, symbol, image, mutable: asset.mutable, updateAuthority };
  })();

  // Use public x402 endpoint: POST /brain with a natural-language question.
  // Docs: https://docs.syraa.fun/docs/api/brain
  const url = `${SYRA_API_BASE}/brain`;
  const question = buildSyraTokenRiskQuestion(mint);

  let res: Response;
  let raw: unknown = {};
  try {
    res = await fetchPay(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question }),
    });
    raw = await readJsonOrText(res);
  } catch (e) {
    const baseHint =
      SYRA_API_BASE.startsWith("/syra")
        ? "Syra x402 requires a same-origin proxy (e.g. /syra) to avoid CORS blocking x402 payment headers."
        : "Syra x402 may require a same-origin proxy to avoid CORS blocking x402 payment headers.";
    const msg0 = e instanceof Error ? e.message : "Syra payment/request failed";
    const msg =
      /payment required/i.test(msg0) || /payment requirements/i.test(msg0)
        ? `${msg0}. ${baseHint}`
        : msg0;
    return {
      mint,
      level: "unknown",
      reason: msg,
      source: "syra",
      fetchedAt: Date.now(),
      onchain,
      raw: { error: msg },
    };
  }

  if (!res.ok) {
    const errMsg =
      typeof (raw as { error?: string }).error === "string"
        ? (raw as { error: string }).error
        : `Syra request failed (${res.status})`;
    return {
      mint,
      level: "unknown",
      reason: errMsg,
      source: "syra",
      fetchedAt: Date.now(),
      onchain,
      raw,
    };
  }

  // Syra response shape may evolve; extract the first meaningful string.
  const responseText = extractFirstString(raw);

  // If Syra gives explicit SAFE/CAUTION/HIGH RISK/UNKNOWN, honor it first.
  const explicit = parseExplicitVerdict(responseText);
  const derived = explicit ?? deriveRiskFromUnknownJson(responseText || raw);
  return {
    mint,
    level: derived.level,
    reason: derived.reason,
    source: "syra",
    fetchedAt: Date.now(),
    onchain,
    raw,
  };
}

