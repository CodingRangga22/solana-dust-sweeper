import { useNavigate, useLocation } from "react-router-dom";
import { Sparkles, Loader2, RotateCcw, CheckCircle2 } from "lucide-react";

interface HeroProps {
  scanning?: boolean;
  scanned?: boolean;
  onScan?: () => void;
  onRescan?: () => void;
  sweeping?: boolean;
  accountsFound?: number;
}

const M: React.CSSProperties = { fontFamily: "var(--font-mono)" };

const Hero = ({ scanning = false, scanned = false, onScan, onRescan, sweeping = false, accountsFound = 0 }: HeroProps) => {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const handleScan = () => {
    if (pathname !== "/app") { navigate("/app"); return; }
    if (onScan) onScan();
  };

  return (
    <section className="relative px-6 pt-24 pb-12 text-center sm:px-8">
      <div
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background:
            "radial-gradient(ellipse 80% 50% at 50% -10%, color-mix(in oklab, hsl(var(--foreground)) 10%, transparent), transparent 55%)",
        }}
        aria-hidden
      />

      <div className="surface-premium mx-auto mb-8 inline-flex items-center gap-2 rounded-full border border-border px-4 py-1.5 text-[11px] font-medium uppercase tracking-[0.12em] text-muted-foreground shadow-premium-sm">
        <Sparkles size={12} className="text-muted-foreground" />
        Solana Wallet Cleaner
      </div>

      <h1 className="mx-auto mb-4 max-w-[600px] text-[clamp(28px,4.5vw,52px)] font-extrabold leading-[1.08] tracking-[-0.025em] text-foreground">
        Clean your wallet,{" "}
        <span className="text-muted-foreground">reclaim your Sol.</span>
      </h1>

      <p className="mx-auto mb-9 max-w-[400px] text-[15px] leading-relaxed text-muted-foreground">
        Find dust tokens and empty accounts. Close them and get your rent deposits back instantly.
      </p>

      {scanning && (
        <div style={{ display: "inline-flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
          <Loader2 size={24} style={{ color: "hsl(var(--muted-foreground))" }} className="animate-spin" />
          <p style={{ ...M, fontSize: 12, color: "hsl(var(--muted-foreground))" }}>Scanning wallet...</p>
          <div style={{ width: 180, height: 2, background: "hsl(var(--border))", borderRadius: 2, overflow: "hidden" }}>
            <div className="animate-[scanProgress_2s_ease-in-out_infinite]"
              style={{ height: "100%", background: "hsl(var(--foreground))", borderRadius: 2, opacity: 0.6 }} />
          </div>
        </div>
      )}

      {!scanning && scanned && (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
          <div
            style={{
              ...M,
              fontSize: 12,
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "8px 18px",
              borderRadius: 8,
              background: "hsl(var(--card))",
              border: "1px solid hsl(var(--border))",
              color: "hsl(var(--foreground))",
            }}
          >
            <CheckCircle2 size={14} />
            {accountsFound > 0
              ? `Found ${accountsFound} sweepable account${accountsFound > 1 ? "s" : ""}`
              : "Scan complete — no sweepable accounts found"}
          </div>
          <button
            onClick={() => onRescan && onRescan()}
            disabled={sweeping}
            className="ar-btn-secondary"
            style={{ ...M, fontSize: 12, cursor: sweeping ? "not-allowed" : "pointer", opacity: sweeping ? 0.5 : 1 }}
          >
            <RotateCcw size={13} />
            Rescan Wallet
          </button>
          {accountsFound === 0 && (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10, marginTop: 8 }}>
              <p style={{ ...M, fontSize: 11, color: "hsl(var(--muted-foreground))" }}>Your wallet is clean! Share it.</p>
              <div style={{ display: "flex", gap: 10 }}>
                <a href="https://twitter.com/intent/tweet?text=Just+cleaned+my+Solana+wallet+with+@Arsweep_AI"
                  target="_blank" rel="noopener noreferrer"
                  style={{ ...M, fontSize: 12, display: "flex", alignItems: "center", gap: 8, padding: "8px 16px", borderRadius: 8, background: "hsl(var(--foreground))", border: "1px solid hsl(var(--border))", color: "hsl(var(--background))", textDecoration: "none" }}>
                  Share on X
                </a>
                <a href="/app?tab=referral"
                  style={{ ...M, fontSize: 12, display: "flex", alignItems: "center", gap: 8, padding: "8px 16px", borderRadius: 8, background: "hsl(var(--muted))", border: "1px solid hsl(var(--border))", color: "hsl(var(--foreground))", textDecoration: "none" }}>
                  <Sparkles size={12} />
                  Invite and Earn
                </a>
              </div>
            </div>
          )}
        </div>
      )}

      {!scanning && !scanned && (
        <button
          onClick={handleScan}
          disabled={sweeping}
          className="ar-btn-primary"
          style={{ ...M, fontSize: 13, cursor: sweeping ? "not-allowed" : "pointer", opacity: sweeping ? 0.5 : 1 }}
        >
          Start Scanning
        </button>
      )}
    </section>
  );
};

export default Hero;
