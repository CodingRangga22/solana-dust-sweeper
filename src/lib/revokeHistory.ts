import { supabase } from "@/lib/supabase";

export type RevokeHistoryRow = {
  wallet_address: string;
  approval_count: number;
  tx_signature: string;
  created_at: string;
};

export type GlobalRevokeTotals = {
  wallets: number;
  approvalsRevoked: number;
};

function featureEnabled(): boolean {
  // Default OFF to avoid noisy 404s if table is not created yet.
  return (import.meta.env.VITE_REVOKE_USE_SUPABASE_HISTORY ?? "").toString() === "true";
}

/**
 * Optional Supabase table:
 *   revoke_history(wallet_address text, approval_count int, tx_signature text, created_at timestamptz default now())
 * Recommended indexes:
 *   (wallet_address, created_at desc)
 */
export async function fetchLastRevoke(walletAddress: string): Promise<RevokeHistoryRow | null> {
  if (!featureEnabled()) return null;
  try {
    const { data, error } = await supabase
      .from("revoke_history")
      .select("wallet_address,approval_count,tx_signature,created_at")
      .eq("wallet_address", walletAddress)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (error || !data) return null;
    return data as any;
  } catch {
    return null;
  }
}

export async function logRevoke(walletAddress: string, approvalCount: number, txSignature: string) {
  if (!featureEnabled()) return;
  try {
    await supabase.from("revoke_history").insert({
      wallet_address: walletAddress,
      approval_count: approvalCount,
      tx_signature: txSignature,
    });
  } catch {
    // ignore (table may not exist)
  }
}

/**
 * Optional public counter. Safe to call even if the table is missing; returns zeros.
 * Aggregates across all wallets.
 */
export async function getGlobalRevokeTotals(opts?: { maxRows?: number; pageSize?: number }): Promise<GlobalRevokeTotals> {
  if (!featureEnabled()) return { wallets: 0, approvalsRevoked: 0 };

  const pageSize = Math.max(1, Math.min(2000, opts?.pageSize ?? 1000));
  const maxRows = Math.max(0, opts?.maxRows ?? 10_000);

  let offset = 0;
  let wallets = 0;
  let approvalsRevoked = 0;

  try {
    while (offset < maxRows) {
      const { data, error } = await supabase
        .from("revoke_history")
        .select("wallet_address, approval_count")
        .range(offset, offset + pageSize - 1);
      if (error) break;
      if (!data || data.length === 0) break;

      wallets += data.length;
      for (const row of data as Array<{ approval_count: number | null }>) {
        approvalsRevoked += Number(row.approval_count ?? 0);
      }

      if (data.length < pageSize) break;
      offset += pageSize;
    }
  } catch {
    return { wallets: 0, approvalsRevoked: 0 };
  }

  return { wallets, approvalsRevoked };
}

