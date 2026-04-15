export type RugcheckRiskLevel = "good" | "warn" | "danger" | "unknown";

export type RugcheckRisk = {
  name: string;
  description?: string;
  level?: string;
  score?: number;
};

export type RugcheckSummary = {
  tokenProgram?: string;
  tokenType?: string;
  risks?: RugcheckRisk[];
  score?: number;
  score_normalised?: number;
  lpLockedPct?: number;
};

export type RugcheckResult = {
  level: RugcheckRiskLevel;
  score: number | null;
  scoreNormalized: number | null;
  lpLockedPct: number | null;
  risks: RugcheckRisk[];
};

const cache = new Map<string, RugcheckResult>();
const inflight = new Map<string, Promise<RugcheckResult>>();

function classifyLevel(summary: RugcheckSummary | null): RugcheckRiskLevel {
  if (!summary) return "unknown";
  const levels = (summary.risks ?? [])
    .map((r) => String(r.level ?? "").toLowerCase())
    .filter(Boolean);
  if (levels.some((l) => l === "danger" || l === "critical" || l === "high")) return "danger";
  if (levels.some((l) => l === "warn" || l === "warning" || l === "medium")) return "warn";
  return "good";
}

function toResult(summary: RugcheckSummary | null): RugcheckResult {
  return {
    level: classifyLevel(summary),
    score: typeof summary?.score === "number" ? summary.score : null,
    scoreNormalized:
      typeof summary?.score_normalised === "number" ? summary.score_normalised : null,
    lpLockedPct: typeof summary?.lpLockedPct === "number" ? summary.lpLockedPct : null,
    risks: Array.isArray(summary?.risks) ? summary!.risks! : [],
  };
}

async function fetchJsonWithTimeout(url: string, timeoutMs = 9000): Promise<unknown> {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      method: "GET",
      headers: { Accept: "application/json" },
      signal: ctrl.signal,
    });
    if (!res.ok) throw new Error(`RugCheck HTTP ${res.status}`);
    return await res.json();
  } finally {
    clearTimeout(t);
  }
}

export async function getRugcheckSummary(mint: string): Promise<RugcheckResult> {
  const key = mint.trim();
  const cached = cache.get(key);
  if (cached) return cached;

  const existing = inflight.get(key);
  if (existing) return existing;

  const p = (async () => {
    try {
      const json = (await fetchJsonWithTimeout(
        `https://api.rugcheck.xyz/v1/tokens/${encodeURIComponent(key)}/report/summary`,
      )) as RugcheckSummary;
      const result = toResult(json ?? null);
      cache.set(key, result);
      return result;
    } catch {
      const result = toResult(null);
      cache.set(key, result);
      return result;
    } finally {
      inflight.delete(key);
    }
  })();

  inflight.set(key, p);
  return p;
}

