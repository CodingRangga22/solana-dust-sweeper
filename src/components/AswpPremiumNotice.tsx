import { useEffect, useMemo } from "react";
import { useWallets } from "@privy-io/react-auth/solana";
import { PublicKey } from "@solana/web3.js";
import { Crown, Sparkles } from "lucide-react";
import { useAswpAccess } from "@/hooks/useAswpAccess";

export default function AswpPremiumNotice({
  compact = false,
}: {
  compact?: boolean;
}) {
  const { wallets } = useWallets();
  const walletAddress = wallets[0]?.address ?? null;
  const owner = useMemo(() => (walletAddress ? new PublicKey(walletAddress) : null), [walletAddress]);
  const aswp = useAswpAccess(owner);

  useEffect(() => {
    void aswp.refresh();
  }, [owner]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <section
      className={[
        "rounded-2xl border border-white/[0.10] bg-white/[0.03] shadow-lg shadow-black/30 backdrop-blur-xl",
        compact ? "p-4" : "p-5",
      ].join(" ")}
    >
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-white/[0.12] to-white/[0.04] ring-1 ring-white/[0.10]">
          <Crown className="h-5 w-5 text-white/85" strokeWidth={1.8} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-white/55">ASWP holder access</p>
          <p className="mt-1 text-sm text-white/80">
            Pemegang <span className="font-semibold text-white">$ASWP</span> dapat akses fitur Premium Agent{" "}
            <span className="font-semibold text-white">gratis</span> lewat beberapa tier kepemilikan.
          </p>
          <p className="mt-2 text-[12px] leading-relaxed text-white/45">
            Semakin besar holding, semakin banyak fitur Premium yang terbuka. Detail tier ditampilkan di dalam Agent saat kamu menjalankan fitur Premium.
          </p>
        </div>
      </div>

      <div className="mt-4 rounded-xl border border-white/[0.08] bg-black/25 px-4 py-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="inline-flex items-center gap-2 text-xs text-white/65">
            <Sparkles className="h-4 w-4 text-white/60" />
            Status wallet kamu
          </div>
          {aswp.loading ? (
            <span className="text-[11px] text-white/45">Mengecek ASWP…</span>
          ) : owner ? (
            <span className="text-[11px] text-white/60">
              {aswp.aswpUsdValue == null ? (
                <>
                  {aswp.aswpUiAmount != null && aswp.aswpUiAmount > 0 ? (
                    <>
                      Tier: <span className="font-semibold text-white">{aswp.tierLabel ?? "ASWP Holder"}</span>
                    </>
                  ) : (
                    <>Harga belum terbaca · tier tidak bisa dihitung</>
                  )}
                </>
              ) : (
                <>
                  {aswp.unlocked.size > 0 ? (
                    <>
                      Akses Premium: <span className="font-semibold text-white">aktif</span>
                    </>
                  ) : (
                    <>
                      Akses Premium: <span className="text-white/55">belum aktif</span>
                    </>
                  )}
                </>
              )}
            </span>
          ) : (
            <span className="text-[11px] text-white/45">Hubungkan wallet untuk cek tier</span>
          )}
        </div>
      </div>
    </section>
  );
}

