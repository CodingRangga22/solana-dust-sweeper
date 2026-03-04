// src/hooks/useReferral.ts
import { useState, useEffect, useCallback } from "react";
import {
  getOrCreateUser,
  getActiveSeason,
  type UserProfile,
  type Season,
} from "@/lib/supabase";

export function useReferral(walletAddress: string | null) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [season, setSeason] = useState<Season | null>(null);
  const [loading, setLoading] = useState(false);

  // Ambil ref code dari URL
  const getRefCodeFromUrl = useCallback((): string | undefined => {
    const params = new URLSearchParams(window.location.search);
    return params.get("ref") ?? undefined;
  }, []);

  // Generate referral link
  const getReferralLink = useCallback((): string => {
    if (!user) return "";
    const base = window.location.origin;
    return `${base}?ref=${user.referral_code}`;
  }, [user]);

  // Init user saat wallet connect
  useEffect(() => {
    if (!walletAddress) {
      setUser(null);
      return;
    }

    const init = async () => {
      setLoading(true);
      try {
        const refCode = getRefCodeFromUrl();
        const [profile, activeSeason] = await Promise.all([
          getOrCreateUser(walletAddress, refCode),
          getActiveSeason(),
        ]);
        setUser(profile);
        setSeason(activeSeason);

        // Hapus ref dari URL setelah diproses
        if (refCode) {
          const url = new URL(window.location.href);
          url.searchParams.delete("ref");
          window.history.replaceState({}, "", url.toString());
        }
      } catch (err) {
        console.error("[useReferral] init error:", err);
      } finally {
        setLoading(false);
      }
    };

    init();
  }, [walletAddress]);

  return { user, season, loading, getReferralLink };
}