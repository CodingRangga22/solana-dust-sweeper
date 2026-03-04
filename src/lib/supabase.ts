// src/lib/supabase.ts
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ── Types ─────────────────────────────────────────────────────────────
export interface Season {
  id: string;
  name: string;
  start_date: string;
  end_date: string;
  is_active: boolean;
}

export interface UserProfile {
  wallet_address: string;
  referral_code: string;
  referred_by: string | null;
  created_at: string;
}

export interface ReferralLeaderboardEntry {
  referrer_code: string;
  wallet_address: string;
  referral_count: number;
  rank: number;
}

export interface SweepLeaderboardEntry {
  wallet_address: string;
  total_accounts_swept: number;
  total_sol_reclaimed: number;
  rank: number;
}

// ── Generate referral code unik 6 karakter ───────────────────────────
export function generateReferralCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  return Array.from({ length: 6 }, () =>
    chars[Math.floor(Math.random() * chars.length)]
  ).join("");
}

// ── Get active season ─────────────────────────────────────────────────
export async function getActiveSeason(): Promise<Season | null> {
  const { data, error } = await supabase
    .from("seasons")
    .select("*")
    .eq("is_active", true)
    .single();
  if (error) return null;
  return data;
}

// ── Get or create user profile ────────────────────────────────────────
export async function getOrCreateUser(
  walletAddress: string,
  refCode?: string
): Promise<UserProfile | null> {
  // Cek apakah user sudah ada
  const { data: existing } = await supabase
    .from("users")
    .select("*")
    .eq("wallet_address", walletAddress)
    .single();

  if (existing) return existing;

  // Buat user baru
  let referralCode = generateReferralCode();

  // Pastikan referral code unik
  let isUnique = false;
  while (!isUnique) {
    const { data: check } = await supabase
      .from("users")
      .select("referral_code")
      .eq("referral_code", referralCode)
      .single();
    if (!check) isUnique = true;
    else referralCode = generateReferralCode();
  }

  const { data: newUser, error } = await supabase
    .from("users")
    .insert({
      wallet_address: walletAddress,
      referral_code: referralCode,
      referred_by: refCode ?? null,
    })
    .select()
    .single();

  if (error) return null;

  // Catat referral kalau ada refCode
  if (refCode) {
    const season = await getActiveSeason();
    if (season) {
      await supabase.from("referrals").insert({
        referrer_code: refCode,
        referred_wallet: walletAddress,
        season_id: season.id,
      });
    }
  }

  return newUser;
}

// ── Get referral leaderboard ──────────────────────────────────────────
export async function getReferralLeaderboard(
  seasonId: string,
  limit = 100
): Promise<ReferralLeaderboardEntry[]> {
  const { data, error } = await supabase
    .from("referrals")
    .select("referrer_code, referred_wallet, users!inner(wallet_address)")
    .eq("season_id", seasonId);

  if (error || !data) return [];

  // Count per referrer
  const counts: Record<string, { code: string; wallet: string; count: number }> = {};
  for (const row of data as any[]) {
    const code = row.referrer_code;
    if (!counts[code]) {
      counts[code] = { code, wallet: row.users?.wallet_address ?? "", count: 0 };
    }
    counts[code].count++;
  }

  return Object.values(counts)
    .sort((a, b) => b.count - a.count)
    .slice(0, limit)
    .map((entry, i) => ({
      referrer_code: entry.code,
      wallet_address: entry.wallet,
      referral_count: entry.count,
      rank: i + 1,
    }));
}

// ── Get sweep leaderboard ─────────────────────────────────────────────
export async function getSweepLeaderboard(
  seasonId: string,
  limit = 100
): Promise<SweepLeaderboardEntry[]> {
  const { data, error } = await supabase
    .from("sweep_stats")
    .select("wallet_address, total_accounts_swept, total_sol_reclaimed")
    .eq("season_id", seasonId)
    .order("total_accounts_swept", { ascending: false })
    .limit(limit);

  if (error || !data) return [];

  return data.map((row, i) => ({ ...row, rank: i + 1 }));
}

// ── Update sweep stats ────────────────────────────────────────────────
export async function updateSweepStats(
  walletAddress: string,
  seasonId: string,
  accountsClosed: number,
  solReclaimed: number
): Promise<void> {
  const { data: existing } = await supabase
    .from("sweep_stats")
    .select("*")
    .eq("wallet_address", walletAddress)
    .eq("season_id", seasonId)
    .single();

  if (existing) {
    await supabase
      .from("sweep_stats")
      .update({
        total_accounts_swept: existing.total_accounts_swept + accountsClosed,
        total_sol_reclaimed: existing.total_sol_reclaimed + solReclaimed,
        updated_at: new Date().toISOString(),
      })
      .eq("wallet_address", walletAddress)
      .eq("season_id", seasonId);
  } else {
    await supabase.from("sweep_stats").insert({
      wallet_address: walletAddress,
      season_id: seasonId,
      total_accounts_swept: accountsClosed,
      total_sol_reclaimed: solReclaimed,
    });
  }
}

// ── $SWEEP token reward per rank ──────────────────────────────────────
export function getTokenReward(rank: number): number {
  if (rank === 1) return 10000;
  if (rank === 2) return 5000;
  if (rank === 3) return 2500;
  if (rank <= 10) return 500;
  if (rank <= 50) return 100;
  if (rank <= 100) return 10;
  return 1;
}