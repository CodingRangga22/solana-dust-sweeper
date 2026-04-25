import { createArsweepFetchWithPayment, type ArsweepX402SigningWallet } from "@/lib/arsweepX402Client";

const SYRA_API_BASE = (import.meta.env.VITE_SYRA_API_BASE?.trim() || "https://api.syraa.fun").replace(/\/$/, "");

export type SyraRiskLevel = "safe" | "caution" | "high" | "unknown";

export type SyraTokenRisk = {
  mint: string;
  level: SyraRiskLevel;
  reason: string;
  source: "syra";
  fetchedAt: number;
  raw?: unknown;
};

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

export async function fetchSyraTokenRisk(
  wallet: ArsweepX402SigningWallet,
  mint: string,
): Promise<SyraTokenRisk> {
  const fetchPay = createArsweepFetchWithPayment(wallet);

  // Docs examples mention `/token-report?address=...`.
  const url = `${SYRA_API_BASE}/token-report?address=${encodeURIComponent(mint)}`;
  const res = await fetchPay(url, { method: "GET" });
  const raw = await readJsonOrText(res);

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
      raw,
    };
  }

  const derived = deriveRiskFromUnknownJson(raw);
  return {
    mint,
    level: derived.level,
    reason: derived.reason,
    source: "syra",
    fetchedAt: Date.now(),
    raw,
  };
}

