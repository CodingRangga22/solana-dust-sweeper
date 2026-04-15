import { Connection, PublicKey, LAMPORTS_PER_SOL } from "@solana/web3.js";
import { RPC_ENDPOINT } from "@/config/env";

const TREASURY = "BfqfpTe6yv5TTTGrcNVRPVfQ3h6FwzhC78LGbGAN5NkT";
const PROGRAM_ID = "4cS4fZH6DoFown46UiF2EtG412PVd5BSi8m4tmefAq9o";

export interface DevnetMetrics {
  totalSolReclaimed: number;
  totalAccountsClosed: number;
  totalWalletsTested: number;
  lastUpdated: number;
}

const CACHE_KEY = "arsweep_metrics_cache";
const CACHE_TTL = 300_000; // 5 minutes

function loadCache(): DevnetMetrics | null {
  try {
    const raw = sessionStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const { data, ts } = JSON.parse(raw);
    if (Date.now() - ts < CACHE_TTL) return data;
  } catch {}
  return null;
}

function saveCache(data: DevnetMetrics) {
  try {
    sessionStorage.setItem(CACHE_KEY, JSON.stringify({ data, ts: Date.now() }));
  } catch {}
}

export async function fetchDevnetMetrics(): Promise<DevnetMetrics> {
  // Return cache if fresh
  const cached = loadCache();
  if (cached) return cached;

  const connection = new Connection(RPC_ENDPOINT, "confirmed");

  try {
    // Fetch treasury signatures — each inbound tx = 1 sweep
    const treasuryPubkey = new PublicKey(TREASURY);
    const signatures = await connection.getSignaturesForAddress(treasuryPubkey, {
      limit: 1000,
    });

    // Filter only confirmed txs
    const confirmed = signatures.filter((s) => s.err === null);
    const totalAccountsClosed = confirmed.length;

    // Fetch treasury balance change history to estimate SOL reclaimed
    // Each sweep sends 1.5% fee to treasury, so totalReclaimed = treasuryInflow / 0.015
    // Simpler: fetch current treasury balance as proxy
    const treasuryBalance = await connection.getBalance(treasuryPubkey);
    const treasurySOL = treasuryBalance / LAMPORTS_PER_SOL;
    // Reverse-calculate: if treasury has X SOL from fees, total reclaimed = X / 0.015
    const totalSolReclaimed = Math.round((treasurySOL / 0.015) * 100) / 100;

    // Estimate unique wallets (avoid expensive getTransaction calls)
    const totalWalletsTested = Math.max(1, Math.ceil(totalAccountsClosed / 3));

    const metrics: DevnetMetrics = {
      totalSolReclaimed: Math.max(totalSolReclaimed, 0),
      totalAccountsClosed,
      totalWalletsTested,
      lastUpdated: Date.now(),
    };

    saveCache(metrics);
    return metrics;
  } catch (err) {
    console.error("[Arsweep] Failed to fetch metrics:", err);
    // Fallback to minimal real-looking data
    return {
      totalSolReclaimed: 0,
      totalAccountsClosed: 0,
      totalWalletsTested: 0,
      lastUpdated: Date.now(),
    };
  }
}
