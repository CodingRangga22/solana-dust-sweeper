export const ASWP_MINT = "dTMaF2F97BWo6s416JqsDrpzdwa1uarKngSwf25pump";

export type PremiumServiceType = "analyze" | "report" | "roast" | "rugcheck" | "planner";

export type AswpTier = {
  /** Minimum ASWP USD value required to unlock this tier. */
  minUsd: number;
  /** Which premium services are unlocked at this tier. */
  unlocks: PremiumServiceType[];
  label: string;
};

/**
 * Tiering (bertahap). Edit thresholds any time.
 *
 * Defaults:
 * - $10: AI Analysis
 * - $20: Rug Detector
 * - $30: Sweep Report
 * - $50: Sweep Planner
 * - $100: Wallet Roast
 */
export const ASWP_TIERS: AswpTier[] = [
  { minUsd: 10, unlocks: ["analyze"], label: "$10+ ASWP" },
  { minUsd: 20, unlocks: ["analyze", "rugcheck"], label: "$20+ ASWP" },
  { minUsd: 30, unlocks: ["analyze", "rugcheck", "report"], label: "$30+ ASWP" },
  { minUsd: 50, unlocks: ["analyze", "rugcheck", "report", "planner"], label: "$50+ ASWP" },
  { minUsd: 100, unlocks: ["analyze", "rugcheck", "report", "planner", "roast"], label: "$100+ ASWP" },
];

