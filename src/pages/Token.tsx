import { useNavigate } from "react-router-dom";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import { ArrowRight, Zap, Shield, Trophy, Users, ExternalLink } from "lucide-react";
import ArsweepLogo from "@/components/ArsweepLogo";
import BrandWordmark from "@/components/BrandWordmark";
import ChatWidget from "@/components/ChatWidget";
import { useBanner } from "@/components/BannerProvider";
import AswpPremiumNotice from "@/components/AswpPremiumNotice";
import ThemeToggle from "@/components/ThemeToggle";

const M: React.CSSProperties = { fontFamily: "var(--font-mono)" };
const D6: React.CSSProperties = { height: 1, background: "hsl(var(--border))" };

const utilities = [
  { icon: Zap, t: "Fee Discounts", d: "Hold $ASWP to get reduced platform fees on every sweep. The more you hold, the less you pay." },
  { icon: Shield, t: "Governance", d: "Vote on future features, fee structures, and protocol upgrades. $ASWP = voting power." },
  { icon: Trophy, t: "Sweep-to-Earn", d: "Every wallet you clean earns $ASWP. The more accounts you close, the more you earn." },
  { icon: Users, t: "Early Access", d: "Token holders get early access to new features and exclusive tools before public release." },
];

const distribution = [
  { label: "Liquidity Pool", pct: 50, desc: "Primary liquidity on Pump.fun and Raydium" },
  { label: "Ecosystem & Rewards", pct: 25, desc: "Leaderboard, referral, and sweep rewards" },
  { label: "Team & Dev", pct: 15, desc: "Vested over 12 months" },
  { label: "Reserve", pct: 10, desc: "Marketing, listings, partnerships" },
];

const TokenPage = () => {
  useScrollReveal();
  const navigate = useNavigate();
  const { bannerHeight } = useBanner();

  const BP: React.CSSProperties = {
    fontFamily: "var(--font-mono)",
    fontSize: 13,
    fontWeight: 700,
    color: "hsl(var(--background))",
    background: "hsl(var(--foreground))",
    border: "none",
    borderRadius: 10,
    padding: "12px 24px",
    cursor: "pointer",
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    transition: "opacity 0.2s",
  };
  const BG: React.CSSProperties = {
    fontFamily: "var(--font-mono)",
    fontSize: 13,
    color: "hsl(var(--muted-foreground))",
    background: "hsl(var(--card))",
    border: "1px solid hsl(var(--border))",
    borderRadius: 10,
    padding: "12px 24px",
    cursor: "pointer",
    transition: "background 0.2s, border-color 0.2s, color 0.2s",
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
  };

  return (
    <div className="arsweep-page-shell font-sans antialiased">

      <div className="arsweep-dot-grid" aria-hidden />
      <div className="arsweep-vignette-fade" aria-hidden />

      <header style={{ position: "fixed", left: 0, right: 0, zIndex: 50, top: bannerHeight, borderBottom: "1px solid hsl(var(--border))", background: "color-mix(in oklab, hsl(var(--background)) 92%, black 8%)", backdropFilter: "blur(20px)" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 32px", height: 56, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }} onClick={() => navigate("/")}>
            <ArsweepLogo className="h-7 w-7 shrink-0" />
            <BrandWordmark />
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <button onClick={() => navigate("/x402")} style={{ ...M, fontSize: 13, color: "hsl(var(--muted-foreground))", background: "none", border: "none", cursor: "pointer" }}>x402</button>
            <button onClick={() => navigate("/agent")} style={{ ...M, fontSize: 13, color: "hsl(var(--muted-foreground))", background: "none", border: "none", cursor: "pointer" }}>← Agent</button>
            <button onClick={() => navigate("/app")} style={{ ...M, fontSize: 13, fontWeight: 600, color: "hsl(var(--background))", background: "hsl(var(--foreground))", border: "none", borderRadius: 8, padding: "7px 18px", cursor: "pointer" }}
              onMouseEnter={e => (e.currentTarget.style.opacity = "0.85")}
              onMouseLeave={e => (e.currentTarget.style.opacity = "1")}
            >Launch App</button>
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* HERO */}
      <section style={{ position: "relative", zIndex: 2, paddingTop: "120px", paddingBottom: 100, textAlign: "center", padding: "120px clamp(16px,5vw,40px) 80px" }}>
        <div style={{ ...M, fontSize: 11, color: "hsl(var(--muted-foreground))", letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: 20, display: "flex", alignItems: "center", justifyContent: "center", gap: 10 }}>
          <span style={{ width: 20, height: 1, background: "hsl(var(--border))", display: "inline-block" }} />
          Solana SPL Token
          <span style={{ width: 20, height: 1, background: "hsl(var(--border))", display: "inline-block" }} />
        </div>

        <h1 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(48px,8vw,88px)", fontWeight: 400, lineHeight: 1.0, letterSpacing: "-0.02em", color: "hsl(var(--foreground))", marginBottom: 24, maxWidth: 800, margin: "0 auto 24px" }}>
          Introducing{" "}
          <span style={{ color: "var(--ar-yellow)" }}>$ASWP</span>
        </h1>

        <p style={{ fontSize: 18, color: "hsl(var(--muted-foreground))", maxWidth: 520, margin: "0 auto 16px", lineHeight: 1.75 }}>
          The native token of the Arsweep ecosystem. Earn it by sweeping. Use it for discounts. Vote with it on governance.
        </p>

        <div style={{ ...M, display: "flex", flexDirection: "column", alignItems: "center", gap: 12, marginBottom: 44 }}>
          <div
            onClick={() => { navigator.clipboard.writeText("dTMaF2F97BWo6s416JqsDrpzdwa1uarKngSwf25pump"); }}
            title="Click to copy CA"
            style={{
              fontSize: 13,
              color: "hsl(var(--foreground))",
              border: "1px solid hsl(var(--border))",
              background: "hsl(var(--card))",
              borderRadius: 999,
              padding: "10px 24px",
              display: "inline-flex",
              alignItems: "center",
              gap: 10,
              cursor: "pointer",
              letterSpacing: "0.04em",
              transition: "all 0.2s",
              fontFamily: "monospace",
              boxShadow: "0 0 0 1px rgba(148,163,184,0.18)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "color-mix(in oklab, hsl(var(--card)) 80%, transparent)";
              e.currentTarget.style.borderColor = "hsl(var(--border))";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "hsl(var(--card))";
              e.currentTarget.style.borderColor = "hsl(var(--border))";
            }}
          >
            <span style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--ar-teal)", display: "inline-block", flexShrink: 0, boxShadow: "0 0 10px rgba(148,163,184,0.22)" }} />
            CA: dTMaF2F97BWo6s416JqsDrpzdwa1uarKngSwf25pump
          </div>
          <a
            href="https://pump.fun/coin/dTMaF2F97BWo6s416JqsDrpzdwa1uarKngSwf25pump"
            target="_blank"
            rel="noopener noreferrer"
            style={{ fontSize: 13, color: "hsl(var(--muted-foreground))", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 6, transition: "color 0.2s", letterSpacing: "0.03em" }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "hsl(var(--foreground))")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "hsl(var(--muted-foreground))")}
          >
            View on Pump.fun →
          </a>
        </div>

        <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
          <button onClick={() => navigate("/app")} style={BP}
            onMouseEnter={e => (e.currentTarget.style.opacity = "0.85")}
            onMouseLeave={e => (e.currentTarget.style.opacity = "1")}
          >
            Earn $ASWP Now
            <ArrowRight size={14} />
          </button>
          <button onClick={() => window.open("https://t.me/arsweepalert", "_blank")} style={BG}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.background = "hsl(var(--muted))";
              (e.currentTarget as HTMLElement).style.borderColor = "hsl(var(--border))";
              (e.currentTarget as HTMLElement).style.color = "hsl(var(--foreground))";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.background = "hsl(var(--card))";
              (e.currentTarget as HTMLElement).style.borderColor = "hsl(var(--border))";
              (e.currentTarget as HTMLElement).style.color = "hsl(var(--muted-foreground))";
            }}
          >
            Join Telegram
            <ExternalLink size={13} />
          </button>
        </div>

        <div style={{ maxWidth: 860, margin: "44px auto 0" }}>
          <AswpPremiumNotice />
        </div>
      </section>

      <div style={D6} />

      {/* UTILITIES */}
      <section style={{ position: "relative", zIndex: 2, padding: "80px clamp(16px,5vw,40px)" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 64 }}>
            <h2 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(28px,4vw,48px)", fontWeight: 400, color: "hsl(var(--foreground))", marginBottom: 12, lineHeight: 1.1 }}>Token Utility</h2>
            <p style={{ fontSize: 16, color: "hsl(var(--muted-foreground))", lineHeight: 1.6 }}>$ASWP is not just a token. It is the backbone of the Arsweep ecosystem.</p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 1, background: "hsl(var(--border))", border: "1px solid hsl(var(--border))", borderRadius: 16, overflow: "hidden" }}>
            {utilities.map(({ icon: Icon, t, d }) => (
              <div
                key={t}
                style={{
                  padding: "28px clamp(16px,3vw,36px)",
                  background: "hsl(var(--card))",
                  transition: "background 0.2s",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "hsl(var(--muted))")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "hsl(var(--card))")}
              >
                <div style={{ width: 44, height: 44, borderRadius: 10, background: "hsl(var(--muted))", border: "1px solid hsl(var(--border))", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 20 }}>
                  <Icon size={20} style={{ color: "hsl(var(--foreground))" }} />
                </div>
                <h3 style={{ fontSize: 18, fontWeight: 700, color: "hsl(var(--foreground))", marginBottom: 10, lineHeight: 1.3 }}>{t}</h3>
                <p style={{ fontSize: 14, color: "hsl(var(--muted-foreground))", lineHeight: 1.75 }}>{d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div style={D6} />

      {/* CTA */}
      <section style={{ position: "relative", zIndex: 2, padding: "80px clamp(16px,5vw,40px)", textAlign: "center" }}>
        <div style={{ maxWidth: 560, margin: "0 auto" }}>
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(28px,4vw,48px)", fontWeight: 400, color: "hsl(var(--foreground))", marginBottom: 16, lineHeight: 1.1 }}>
            Start earning{" "}
            <span style={{ color: "var(--ar-yellow)" }}>$ASWP</span>
            {" "}today.
          </h2>
          <p style={{ fontSize: 16, color: "hsl(var(--muted-foreground))", lineHeight: 1.75, marginBottom: 40 }}>
            Sweep your wallet, refer friends, climb the leaderboard. Every action earns you $ASWP.
          </p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <button onClick={() => navigate("/app")} style={BP}
              onMouseEnter={e => (e.currentTarget.style.opacity = "0.85")}
              onMouseLeave={e => (e.currentTarget.style.opacity = "1")}
            >
              Launch App
              <ArrowRight size={14} />
            </button>
            <button onClick={() => window.open("https://t.me/arsweepalert", "_blank")} style={BG}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.background = "hsl(var(--muted))";
                (e.currentTarget as HTMLElement).style.borderColor = "hsl(var(--border))";
                (e.currentTarget as HTMLElement).style.color = "hsl(var(--foreground))";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.background = "hsl(var(--card))";
                (e.currentTarget as HTMLElement).style.borderColor = "hsl(var(--border))";
                (e.currentTarget as HTMLElement).style.color = "hsl(var(--muted-foreground))";
              }}
            >
              Join Telegram
              <ExternalLink size={13} />
            </button>
          </div>
        </div>
      </section>

      <div style={D6} />

      {/* FOOTER */}
      <footer style={{ position: "relative", zIndex: 2, padding: "20px clamp(16px,4vw,40px)", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12, maxWidth: 1200, margin: "0 auto" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <ArsweepLogo className="w-6 h-6" />
          <span style={{ ...M, fontSize: 12, color: "hsl(var(--muted-foreground))" }}>Arsweep — built for Solana. 2026</span>
        </div>
        <div style={{ display: "flex", gap: 24 }}>
          {[["Home","/"],["App","/app"],["Docs","/docs"],["Telegram","https://t.me/arsweepalert"]].map(([l,p]) => (
            <span key={l} onClick={() => p.startsWith("http") ? window.open(p,"_blank") : navigate(p)}
              style={{ ...M, fontSize: 12, color: "hsl(var(--muted-foreground))", cursor: "pointer", transition: "color 0.2s" }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "hsl(var(--foreground))")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "hsl(var(--muted-foreground))")}
            >{l}</span>
          ))}
        </div>
      </footer>

      <ChatWidget />
    </div>
  );
};

export default TokenPage;
