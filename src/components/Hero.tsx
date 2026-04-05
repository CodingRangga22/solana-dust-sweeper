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
    <section style={{ paddingTop: 96, paddingBottom: 48, paddingLeft: 24, paddingRight: 24, textAlign: "center" }}>

      <div style={{ ...M, fontSize: 11, color: "rgba(255,255,255,0.4)", border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.03)", borderRadius: 999, padding: "5px 16px", display: "inline-flex", alignItems: "center", gap: 8, marginBottom: 28, letterSpacing: "0.08em" }}>
        <Sparkles size={11} style={{ color: "rgba(255,255,255,0.4)" }} />
        Solana Wallet Cleaner
      </div>

      <h1 style={{ fontSize: "clamp(28px,4.5vw,52px)", fontWeight: 800, lineHeight: 1.08, letterSpacing: "-0.025em", color: "#FFFFFF", margin: "0 auto 16px", maxWidth: 600 }}>
        Clean your wallet,{" "}
        <span style={{ color: "rgba(255,255,255,0.55)" }}>reclaim your Sol.</span>
      </h1>

      <p style={{ fontSize: 15, color: "rgba(255,255,255,0.4)", maxWidth: 400, margin: "0 auto 36px", lineHeight: 1.75 }}>
        Find dust tokens and empty accounts. Close them and get your rent deposits back instantly.
      </p>

      {scanning && (
        <div style={{ display: "inline-flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
          <Loader2 size={24} style={{ color: "rgba(255,255,255,0.6)" }} className="animate-spin" />
          <p style={{ ...M, fontSize: 12, color: "rgba(255,255,255,0.35)" }}>Scanning wallet...</p>
          <div style={{ width: 180, height: 2, background: "rgba(255,255,255,0.08)", borderRadius: 2, overflow: "hidden" }}>
            <div className="animate-[scanProgress_2s_ease-in-out_infinite]"
              style={{ height: "100%", background: "rgba(255,255,255,0.5)", borderRadius: 2 }} />
          </div>
        </div>
      )}

      {!scanning && scanned && (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
          <div style={{ ...M, fontSize: 12, display: "flex", alignItems: "center", gap: 8, padding: "8px 18px", borderRadius: 8, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.7)" }}>
            <CheckCircle2 size={14} />
            {accountsFound > 0
              ? `Found ${accountsFound} sweepable account${accountsFound > 1 ? "s" : ""}`
              : "Scan complete — no sweepable accounts found"}
          </div>
          <button
            onClick={() => onRescan && onRescan()}
            disabled={sweeping}
            style={{ ...M, fontSize: 12, display: "flex", alignItems: "center", gap: 8, padding: "8px 18px", borderRadius: 8, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.45)", cursor: sweeping ? "not-allowed" : "pointer", opacity: sweeping ? 0.5 : 1 }}
          >
            <RotateCcw size={13} />
            Rescan Wallet
          </button>
          {accountsFound === 0 && (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10, marginTop: 8 }}>
              <p style={{ ...M, fontSize: 11, color: "rgba(255,255,255,0.25)" }}>Your wallet is clean! Share it.</p>
              <div style={{ display: "flex", gap: 10 }}>
                <a href="https://twitter.com/intent/tweet?text=Just+cleaned+my+Solana+wallet+with+@Arsweep_AI"
                  target="_blank" rel="noopener noreferrer"
                  style={{ ...M, fontSize: 12, display: "flex", alignItems: "center", gap: 8, padding: "8px 16px", borderRadius: 8, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: "#FFFFFF", textDecoration: "none" }}>
                  Share on X
                </a>
                <a href="/app?tab=referral"
                  style={{ ...M, fontSize: 12, display: "flex", alignItems: "center", gap: 8, padding: "8px 16px", borderRadius: 8, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.6)", textDecoration: "none" }}>
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
          style={{ ...M, fontSize: 13, fontWeight: 500, color: "#0B0F14", background: "#FFFFFF", border: "none", borderRadius: 8, padding: "13px 32px", cursor: sweeping ? "not-allowed" : "pointer", opacity: sweeping ? 0.5 : 1, transition: "opacity 0.2s" }}
          onMouseEnter={e => { if (!sweeping) (e.currentTarget as HTMLElement).style.opacity = "0.85"; }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.opacity = sweeping ? "0.5" : "1"; }}
        >
          Start Scanning
        </button>
      )}
    </section>
  );
};

export default Hero;
