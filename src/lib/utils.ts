import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * SPL token raw amount → human-readable string (same idea as wallet `uiAmount`).
 */
export function formatTokenUiBalance(raw: bigint, decimals: number): string {
  const dec = Math.min(Math.max(0, decimals), 30);
  if (raw === 0n) return "0";

  const maxN = BigInt(Number.MAX_SAFE_INTEGER);
  const minN = BigInt(Number.MIN_SAFE_INTEGER);
  if (raw <= maxN && raw >= minN) {
    const human = Number(raw) / 10 ** dec;
    const abs = Math.abs(human);
    if (abs >= 1_000_000) {
      return new Intl.NumberFormat(undefined, {
        notation: "compact",
        maximumFractionDigits: 2,
      }).format(human);
    }
    return new Intl.NumberFormat(undefined, {
      minimumFractionDigits: 0,
      maximumFractionDigits: Math.min(8, dec || 8),
    }).format(human);
  }

  const base = 10n ** BigInt(dec);
  const neg = raw < 0n;
  const n = neg ? -raw : raw;
  const whole = n / base;
  const frac = n % base;
  let fracStr = frac.toString().padStart(dec, "0").replace(/0+$/, "");
  if (fracStr.length > 14) fracStr = `${fracStr.slice(0, 14)}…`;
  const s = fracStr ? `${whole}.${fracStr}` : `${whole}`;
  return neg ? `-${s}` : s;
}
