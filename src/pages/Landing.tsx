import React, { useState } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import {
  Shield,
  Lock,
  Code2,
  Zap,
  BarChart3,
  Users,
  Wallet,
  Search,
  CheckCircle2,
  ArrowRight,
} from "lucide-react";
import ArsweepLogo from "@/components/ArsweepLogo";
import ThemeToggle from "@/components/ThemeToggle";
import HeroDemo from "@/components/HeroDemo";

// ─── Palette ──────────────────────────────────────────────────────────────────
const T = {
  bg:          "#0B0F14",
  text:        "#FFFFFF",
  sec:         "rgba(255,255,255,0.55)",
  muted:       "rgba(255,255,255,0.35)",
  dim:         "rgba(255,255,255,0.20)",
  border:      "rgba(255,255,255,0.07)",
  borderHov:   "rgba(255,255,255,0.15)",
  card:        "rgba(255,255,255,0.03)",
  cardHov:     "rgba(255,255,255,0.06)",
  teal:        "#1DB88E",
  yellow:      "#E8FF47",
};

// ─── Fonts ────────────────────────────────────────────────────────────────────
const serif = "'DM Serif Display', serif";
const mono  = "'IBM Plex Mono', monospace";
const body  = "'Inter', sans-serif";

// ─── Scroll-fade wrapper ──────────────────────────────────────────────────────
const Fade = ({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) => (
  <motion.div
    initial={{ opacity: 0, y: 28 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, amount: 0.12 }}
    transition={{ duration: 0.65, ease: "easeOut", delay }}
  >
    {children}
  </motion.div>
);

// ─── Divider ──────────────────────────────────────────────────────────────────
const Divider = () => (
  <div style={{ height: 1, background: "rgba(255,255,255,0.06)", margin: "0 auto", maxWidth: 1200 }} />
);

// ─── Section label ────────────────────────────────────────────────────────────
const SectionLabel = ({ text }: { text: string }) => (
  <p style={{ fontFamily: mono, fontSize: 11, color: T.muted, letterSpacing: "0.14em", marginBottom: 16 }}>
    {text}
  </p>
);

// ─── Status badge helper ──────────────────────────────────────────────────────
function statusStyle(s: string): React.CSSProperties {
  switch (s) {
    case "COMPLETED":
    case "LIVE NOW":
      return { color: T.teal,  border: `1px solid rgba(29,184,142,0.25)`, background: "rgba(29,184,142,0.08)" };
    case "IN PROGRESS":
      return { color: "rgba(255,255,255,0.6)", border: "1px solid rgba(255,255,255,0.15)", background: "rgba(255,255,255,0.05)" };
    case "COMING SOON":
      return { color: "rgba(255,255,255,0.4)", border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.03)" };
    default:
      return { color: "rgba(255,255,255,0.25)", border: "1px solid rgba(255,255,255,0.06)", background: "transparent" };
  }
}

// ─── Data ─────────────────────────────────────────────────────────────────────
const steps = [
  { icon: Wallet,       title: "Connect",   desc: "Connect — we only look, not touch" },
  { icon: Search,       title: "Detect",    desc: "We find what's been quietly draining you" },
  { icon: CheckCircle2, title: "Reclaim",   desc: "You approve. SOL lands back. Done." },
];

const features = [
  { icon: Lock,        title: "Non-Custodial",    desc: "No private key access. Your wallet, your control, always." },
  { icon: CheckCircle2,title: "On-Chain",          desc: "All operations fully verified on the Solana blockchain." },
  { icon: Code2,       title: "Open Source",       desc: "Transparent code — auditable by anyone, anytime." },
  { icon: Zap,         title: "Under 5 Seconds",   desc: "Connect, scan, sweep. Done before you know it." },
  { icon: BarChart3,   title: "1.5% Fee Only",     desc: "We only take 1.5% of what we recover. Nothing else." },
  { icon: Users,       title: "Solana Native",     desc: "Built specifically for the Solana ecosystem." },
];

const securityItems = [
  { icon: Lock,   title: "Keys Never Leave",    desc: "We never request signing rights beyond CloseAccount. Private keys stay in your wallet." },
  { icon: Shield, title: "Standard Instructions", desc: "Only standard SPL CloseAccount instructions are used. No custom on-chain programs." },
  { icon: Code2,  title: "Fully Auditable",      desc: "Open-source codebase. Every line is readable and verifiable before you approve anything." },
];

const roadmap = [
  { title: "Wallet Scanner",       desc: "Connect & scan all SPL token accounts",       status: "COMPLETED"   },
  { title: "Batch Close Engine",   desc: "Batch CloseAccount instructions in one tx",   status: "COMPLETED"   },
  { title: "Fee System",           desc: "Transparent 1.5% service fee to treasury",    status: "COMPLETED"   },
  { title: "AI Agent",             desc: "Groq-powered token analysis assistant",        status: "LIVE NOW"    },
  { title: "Telegram Integration", desc: "Access Arsweep via Telegram Web App",          status: "IN PROGRESS" },
  { title: "Jupiter Swap",         desc: "Swap dust tokens before closing accounts",     status: "IN PROGRESS" },
  { title: "Leaderboard",          desc: "Global sweep rankings and analytics",          status: "COMING SOON" },
  { title: "$ARSWP Token",         desc: "Governance and utility token launch",          status: "Q3"          },
  { title: "Mobile App",           desc: "Native iOS and Android experience",            status: "FUTURE"      },
];

const RENT = 0.00203928;
const MAX_ACCS = 50;

// ─────────────────────────────────────────────────────────────────────────────
const Landing = () => {
  const navigate = useNavigate();
  const [accounts, setAccounts] = useState(10);

  const totalSOL = accounts * RENT;
  const fee      = totalSOL * 0.015;
  const netSOL   = totalSOL - fee;

  const completedCount = roadmap.filter(r => r.status === "COMPLETED" || r.status === "LIVE NOW").length;
  const progressPct    = Math.round((completedCount / roadmap.length) * 100);

  return (
    <div style={{ backgroundColor: T.bg, minHeight: "100vh", color: T.text, fontFamily: body, overflowX: "hidden", position: "relative" }}>

      {/* Background layers */}
      <div style={{
        position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0,
        backgroundImage: [
          "radial-gradient(ellipse at 25% 40%, rgba(255,215,0,0.045), transparent 45%)",
          "radial-gradient(ellipse at 75% 60%, rgba(255,120,73,0.045), transparent 50%)",
        ].join(", "),
      }} />
      <div className="landing-dot-grid" style={{ position: "fixed", inset: 0, zIndex: 0 }} />

      {/* ── NAVBAR ─────────────────────────────────────────────────────────── */}
      <header style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 50,
        height: 56,
        background: "rgba(11,15,20,0.85)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        borderBottom: "1px solid rgba(255,255,255,0.05)",
      }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px", height: "100%", display: "flex", alignItems: "center", justifyContent: "space-between" }}>

          {/* Left: Logo + name */}
          <Link to="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
            <ArsweepLogo className="w-7 h-7" />
            <span style={{ fontFamily: mono, fontSize: 14, fontWeight: 500, color: T.text, letterSpacing: "0.08em" }}>
              ARSWEEP
            </span>
          </Link>

          {/* Center: Nav links */}
          <nav style={{ display: "flex", alignItems: "center", gap: 32 }} className="hidden md:flex">
            {[
              { label: "Directory", to: "/directory" },
              { label: "Docs",      to: "/docs"      },
              { label: "$ARSWP",    to: "/token"     },
              { label: "Agent",     to: "/agent"     },
            ].map((item) => (
              <Link
                key={item.label}
                to={item.to}
                style={{ fontFamily: mono, fontSize: 13, color: "rgba(255,255,255,0.5)", textDecoration: "none", transition: "color 0.2s" }}
                onMouseEnter={e => (e.currentTarget.style.color = "#fff")}
                onMouseLeave={e => (e.currentTarget.style.color = "rgba(255,255,255,0.5)")}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Right: ThemeToggle + Launch App */}
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <ThemeToggle />
            <button
              onClick={() => navigate("/app")}
              style={{
                fontFamily: mono, fontSize: 13, fontWeight: 500,
                color: T.text,
                background: "rgba(255,255,255,0.08)",
                border: "1px solid rgba(255,255,255,0.12)",
                borderRadius: 8,
                padding: "8px 16px",
                cursor: "pointer",
                transition: "background 0.2s, border-color 0.2s",
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.13)"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.08)"; }}
            >
              Launch App
            </button>
          </div>
        </div>
      </header>

      {/* ── HERO ───────────────────────────────────────────────────────────── */}
      <section style={{ position: "relative", zIndex: 1, paddingTop: 120, paddingBottom: 96, paddingLeft: 24, paddingRight: 24 }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 48, alignItems: "center" }}>

          {/* Left */}
          <motion.div initial={{ opacity: 0, y: 32 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, ease: "easeOut" }}>

            {/* Live badge */}
            <div style={{ display: "inline-flex", alignItems: "center", gap: 8, border: "1px solid rgba(255,255,255,0.12)", background: "rgba(255,255,255,0.04)", borderRadius: 999, padding: "6px 14px", marginBottom: 28 }}>
              <span style={{ width: 7, height: 7, borderRadius: "50%", background: T.teal, display: "inline-block", boxShadow: `0 0 8px ${T.teal}` }} />
              <span style={{ fontFamily: mono, fontSize: 11, color: "rgba(255,255,255,0.7)", letterSpacing: "0.06em" }}>
                Mainnet is live — sweep your wallet now
              </span>
            </div>

            {/* Headline */}
            <h1 style={{ fontFamily: serif, lineHeight: 1.15, marginBottom: 24, fontSize: "clamp(40px, 6vw, 72px)" }}>
              <span style={{ display: "block", color: T.text }}>Reclaim SOL</span>
              <span style={{ display: "block", color: "rgba(255,255,255,0.45)" }}>locked in your</span>
              <span style={{ display: "block", color: "rgba(255,255,255,0.18)" }}>dead accounts.</span>
            </h1>

            {/* Subtext */}
            <p style={{ fontFamily: body, fontSize: 16, color: "rgba(255,255,255,0.4)", lineHeight: 1.7, marginBottom: 36, maxWidth: 440 }}>
              Every empty token account locks{" "}
              <span style={{ color: "rgba(255,255,255,0.85)" }}>~0.002 SOL</span>{" "}
              in rent. Arsweep finds them all and gives it back — non-custodial, on-chain, instant.
            </p>

            {/* Buttons */}
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 48 }}>
              <button
                onClick={() => navigate("/app")}
                style={{
                  fontFamily: mono, fontSize: 13, fontWeight: 500,
                  background: T.text, color: T.bg,
                  border: "none", borderRadius: 8,
                  padding: "12px 24px", cursor: "pointer",
                  display: "flex", alignItems: "center", gap: 8,
                  transition: "opacity 0.2s",
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.opacity = "0.85"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.opacity = "1"; }}
              >
                Launch App <ArrowRight size={15} />
              </button>
              <a
                href="/docs"
                style={{
                  fontFamily: mono, fontSize: 13,
                  background: "none",
                  border: "1px solid rgba(255,255,255,0.12)",
                  borderRadius: 8, padding: "12px 24px",
                  color: "rgba(255,255,255,0.45)",
                  textDecoration: "none", cursor: "pointer",
                  display: "inline-flex", alignItems: "center", gap: 8,
                  transition: "border-color 0.2s, color 0.2s",
                }}
                onMouseEnter={e => { const a = e.currentTarget as HTMLAnchorElement; a.style.borderColor = "rgba(255,255,255,0.25)"; a.style.color = "rgba(255,255,255,0.8)"; }}
                onMouseLeave={e => { const a = e.currentTarget as HTMLAnchorElement; a.style.borderColor = "rgba(255,255,255,0.12)"; a.style.color = "rgba(255,255,255,0.45)"; }}
              >
                Read the docs
              </a>
            </div>

            {/* Stats */}
            <div style={{ display: "flex", gap: 40 }}>
              {[
                { value: "~0.002",  label: "SOL per account" },
                { value: "1.5%",    label: "Platform fee"    },
                { value: "<5s",     label: "Sweep time"      },
              ].map((s) => (
                <div key={s.label}>
                  <div style={{ fontFamily: body, fontSize: 20, fontWeight: 700, color: T.text, lineHeight: 1 }}>{s.value}</div>
                  <div style={{ fontFamily: mono, fontSize: 11, color: "rgba(255,255,255,0.3)", marginTop: 6, letterSpacing: "0.06em" }}>{s.label.toUpperCase()}</div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Right: HeroDemo */}
          <motion.div
            className="hidden lg:flex"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.3 }}
            style={{ justifyContent: "center", alignItems: "center" }}
          >
            <HeroDemo />
          </motion.div>
        </div>
      </section>

      <Divider />

      {/* ── HOW IT WORKS ───────────────────────────────────────────────────── */}
      <section style={{ position: "relative", zIndex: 1, padding: "96px 24px" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <Fade>
            <div style={{ textAlign: "center", marginBottom: 64 }}>
              <SectionLabel text="HOW IT WORKS" />
              <h2 style={{ fontFamily: serif, fontSize: "clamp(28px,4vw,48px)", color: T.text, marginBottom: 12 }}>
                How It Works
              </h2>
              <p style={{ fontFamily: body, fontSize: 16, color: "rgba(255,255,255,0.4)" }}>
                Three steps. Under three minutes.
              </p>
            </div>
          </Fade>

          {/* Grid with gap separators */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 1, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 16, overflow: "hidden" }}>
            {steps.map((step, i) => (
              <Fade key={step.title} delay={i * 0.1}>
                <div
                  style={{ padding: "36px 32px", background: T.bg, cursor: "default", transition: "background 0.2s" }}
                  onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.background = T.cardHov; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.background = T.bg; }}
                >
                  {/* Icon box */}
                  <div style={{ width: 40, height: 40, borderRadius: 10, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 20 }}>
                    <step.icon size={18} color="rgba(255,255,255,0.6)" />
                  </div>
                  {/* Step number */}
                  <div style={{ fontFamily: mono, fontSize: 11, color: T.muted, letterSpacing: "0.1em", marginBottom: 10 }}>
                    STEP {i + 1}
                  </div>
                  <h3 style={{ fontFamily: body, fontSize: 17, fontWeight: 600, color: T.text, marginBottom: 10 }}>{step.title}</h3>
                  <p style={{ fontFamily: body, fontSize: 14, color: "rgba(255,255,255,0.45)", lineHeight: 1.75 }}>{step.desc}</p>
                </div>
              </Fade>
            ))}
          </div>
        </div>
      </section>

      <Divider />

      {/* ── WHAT IS ARSWEEP ────────────────────────────────────────────────── */}
      <section style={{ position: "relative", zIndex: 1, padding: "96px 24px" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <Fade>
            <div style={{ textAlign: "center", marginBottom: 64 }}>
              <SectionLabel text="WHAT IS ARSWEEP" />
              <h2 style={{ fontFamily: serif, fontSize: "clamp(28px,4vw,48px)", color: T.text, marginBottom: 12 }}>
                What is Arsweep
              </h2>
              <p style={{ fontFamily: body, fontSize: 16, color: "rgba(255,255,255,0.4)" }}>
                A non-custodial Solana wallet hygiene tool — nothing more, nothing less.
              </p>
            </div>
          </Fade>

          {/* 3×2 grid */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 1, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 16, overflow: "hidden" }}>
            {features.map((f, i) => (
              <Fade key={f.title} delay={i * 0.08}>
                <div
                  style={{ padding: "32px", background: T.bg, transition: "background 0.2s" }}
                  onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.background = T.cardHov; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.background = T.bg; }}
                >
                  <div style={{ width: 40, height: 40, borderRadius: 10, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 18 }}>
                    <f.icon size={18} color="rgba(255,255,255,0.6)" />
                  </div>
                  <h3 style={{ fontFamily: body, fontSize: 17, fontWeight: 600, color: T.text, marginBottom: 8 }}>{f.title}</h3>
                  <p style={{ fontFamily: body, fontSize: 14, color: "rgba(255,255,255,0.45)", lineHeight: 1.75 }}>{f.desc}</p>
                </div>
              </Fade>
            ))}
          </div>
        </div>
      </section>

      <Divider />

      {/* ── SOL CALCULATOR ─────────────────────────────────────────────────── */}
      <section style={{ position: "relative", zIndex: 1, padding: "96px 24px" }}>
        <div style={{ maxWidth: 720, margin: "0 auto" }}>
          <Fade>
            <div style={{ textAlign: "center", marginBottom: 56 }}>
              <SectionLabel text="SOL CALCULATOR" />
              <h2 style={{ fontFamily: serif, fontSize: "clamp(28px,4vw,48px)", color: T.text, marginBottom: 12 }}>
                SOL Calculator
              </h2>
              <p style={{ fontFamily: body, fontSize: 16, color: "rgba(255,255,255,0.4)" }}>
                How much are you leaving behind?
              </p>
            </div>
          </Fade>

          <Fade delay={0.1}>
            <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 16, padding: "40px 36px" }}>

              {/* Label + input row */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                <span style={{ fontFamily: body, fontSize: 15, color: T.sec }}>Empty token accounts</span>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <input
                    type="number"
                    min={0} max={MAX_ACCS}
                    value={accounts}
                    onChange={e => setAccounts(Math.max(0, Math.min(MAX_ACCS, Number(e.target.value))))}
                    style={{
                      width: 64, textAlign: "center",
                      fontFamily: mono, fontSize: 16, fontWeight: 500,
                      color: T.text, background: "rgba(255,255,255,0.06)",
                      border: "1px solid rgba(255,255,255,0.12)",
                      borderRadius: 8, padding: "6px 10px",
                      outline: "none",
                    }}
                  />
                </div>
              </div>

              {/* Slider */}
              <input
                type="range"
                min={0} max={MAX_ACCS}
                value={accounts}
                onChange={e => setAccounts(Number(e.target.value))}
                style={{ width: "100%", accentColor: T.text, marginBottom: 16, cursor: "pointer" }}
              />

              {/* Presets */}
              <div style={{ display: "flex", gap: 8, marginBottom: 32 }}>
                {[
                  { label: "25%", val: Math.round(MAX_ACCS * 0.25) },
                  { label: "50%", val: Math.round(MAX_ACCS * 0.50) },
                  { label: "MAX", val: MAX_ACCS },
                ].map((p) => (
                  <button
                    key={p.label}
                    onClick={() => setAccounts(p.val)}
                    style={{
                      fontFamily: mono, fontSize: 12,
                      color: accounts === p.val ? T.text : T.muted,
                      background: accounts === p.val ? "rgba(255,255,255,0.1)" : "rgba(255,255,255,0.04)",
                      border: `1px solid ${accounts === p.val ? "rgba(255,255,255,0.2)" : "rgba(255,255,255,0.07)"}`,
                      borderRadius: 6, padding: "5px 14px", cursor: "pointer", transition: "all 0.15s",
                    }}
                  >
                    {p.label}
                  </button>
                ))}
              </div>

              {/* Result card */}
              <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12, padding: "24px 28px", display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 24 }}>
                {[
                  { label: "RECOVERABLE",    val: `${totalSOL.toFixed(5)} SOL` },
                  { label: "FEE (1.5%)",      val: `${fee.toFixed(6)} SOL`    },
                  { label: "NET TO WALLET",   val: `${netSOL.toFixed(5)} SOL`  },
                ].map((r) => (
                  <div key={r.label} style={{ textAlign: "center" }}>
                    <div style={{ fontFamily: mono, fontSize: 11, color: T.muted, letterSpacing: "0.1em", marginBottom: 8 }}>{r.label}</div>
                    <div style={{ fontFamily: mono, fontSize: 16, fontWeight: 500, color: T.text }}>{r.val}</div>
                  </div>
                ))}
              </div>

              <p style={{ fontFamily: mono, fontSize: 11, color: T.dim, marginTop: 16, textAlign: "center", letterSpacing: "0.04em" }}>
                Based on ~0.00203928 SOL rent per account
              </p>
            </div>
          </Fade>
        </div>
      </section>

      <Divider />

      {/* ── SECURITY ───────────────────────────────────────────────────────── */}
      <section style={{ position: "relative", zIndex: 1, padding: "96px 24px" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <Fade>
            <div style={{ textAlign: "center", marginBottom: 64 }}>
              <SectionLabel text="SECURITY" />
              <h2 style={{ fontFamily: serif, fontSize: "clamp(28px,4vw,48px)", color: T.text, marginBottom: 12 }}>
                Security
              </h2>
              <p style={{ fontFamily: body, fontSize: 16, color: "rgba(255,255,255,0.4)" }}>
                Your keys never leave your wallet.
              </p>
            </div>
          </Fade>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 1, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 16, overflow: "hidden" }}>
            {securityItems.map((s, i) => (
              <Fade key={s.title} delay={i * 0.1}>
                <div
                  style={{ padding: "36px 32px", background: T.bg, transition: "background 0.2s" }}
                  onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.background = T.cardHov; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.background = T.bg; }}
                >
                  <div style={{ width: 40, height: 40, borderRadius: 10, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 20 }}>
                    <s.icon size={18} color="rgba(255,255,255,0.6)" />
                  </div>
                  <h3 style={{ fontFamily: body, fontSize: 17, fontWeight: 600, color: T.text, marginBottom: 10 }}>{s.title}</h3>
                  <p style={{ fontFamily: body, fontSize: 14, color: "rgba(255,255,255,0.45)", lineHeight: 1.75 }}>{s.desc}</p>
                </div>
              </Fade>
            ))}
          </div>
        </div>
      </section>

      <Divider />

      {/* ── ROADMAP ────────────────────────────────────────────────────────── */}
      <section style={{ position: "relative", zIndex: 1, padding: "96px 24px" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <Fade>
            <div style={{ textAlign: "center", marginBottom: 56 }}>
              <SectionLabel text="ROADMAP" />
              <h2 style={{ fontFamily: serif, fontSize: "clamp(28px,4vw,48px)", color: T.text, marginBottom: 12 }}>
                Roadmap
              </h2>
              <p style={{ fontFamily: body, fontSize: 16, color: "rgba(255,255,255,0.4)", marginBottom: 32 }}>
                Where we've been, where we're going.
              </p>

              {/* Progress bar */}
              <div style={{ maxWidth: 480, margin: "0 auto" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                  <span style={{ fontFamily: mono, fontSize: 11, color: T.muted, letterSpacing: "0.08em" }}>PROGRESS</span>
                  <span style={{ fontFamily: mono, fontSize: 11, color: T.muted }}>{progressPct}%</span>
                </div>
                <div style={{ height: 4, background: "rgba(255,255,255,0.07)", borderRadius: 999, overflow: "hidden" }}>
                  <motion.div
                    initial={{ width: 0 }}
                    whileInView={{ width: `${progressPct}%` }}
                    viewport={{ once: true }}
                    transition={{ duration: 1.2, ease: "easeOut" }}
                    style={{ height: "100%", background: T.teal, borderRadius: 999 }}
                  />
                </div>
              </div>
            </div>
          </Fade>

          {/* 3×3 grid */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 1, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 16, overflow: "hidden" }}>
            {roadmap.map((item, i) => (
              <Fade key={item.title} delay={i * 0.06}>
                <div
                  style={{ padding: "28px 28px", background: T.bg, transition: "background 0.2s", height: "100%" }}
                  onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.background = T.cardHov; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.background = T.bg; }}
                >
                  {/* Status badge */}
                  <div style={{ marginBottom: 14 }}>
                    <span style={{
                      fontFamily: mono, fontSize: 10, fontWeight: 500,
                      letterSpacing: "0.1em", padding: "3px 10px", borderRadius: 999,
                      ...statusStyle(item.status),
                    }}>
                      {item.status}
                    </span>
                  </div>
                  <h3 style={{ fontFamily: body, fontSize: 15, fontWeight: 600, color: T.text, marginBottom: 6 }}>{item.title}</h3>
                  <p style={{ fontFamily: body, fontSize: 13, color: "rgba(255,255,255,0.4)", lineHeight: 1.65 }}>{item.desc}</p>
                </div>
              </Fade>
            ))}
          </div>
        </div>
      </section>

      <Divider />

      {/* ── CTA BOTTOM ─────────────────────────────────────────────────────── */}
      <section style={{ position: "relative", zIndex: 1, padding: "96px 24px" }}>
        <div style={{ maxWidth: 720, margin: "0 auto", textAlign: "center" }}>
          <Fade>
            <h2 style={{ fontFamily: serif, fontSize: "clamp(32px,5vw,64px)", color: T.text, lineHeight: 1.15, marginBottom: 20 }}>
              Your SOL is already{" "}
              <span style={{ color: T.yellow }}>yours.</span>
            </h2>
            <p style={{ fontFamily: body, fontSize: 16, color: "rgba(255,255,255,0.4)", lineHeight: 1.7, marginBottom: 40, maxWidth: 420, margin: "0 auto 40px" }}>
              No email. No signup. Connect wallet, scan, done.
            </p>
            <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
              <button
                onClick={() => navigate("/app")}
                style={{
                  fontFamily: mono, fontSize: 13, fontWeight: 500,
                  background: T.text, color: T.bg,
                  border: "none", borderRadius: 8,
                  padding: "12px 28px", cursor: "pointer",
                  display: "flex", alignItems: "center", gap: 8,
                  transition: "opacity 0.2s",
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.opacity = "0.85"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.opacity = "1"; }}
              >
                Launch App <ArrowRight size={15} />
              </button>
              <a
                href="https://t.me/+657UAJGoNE02NDM1"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  fontFamily: mono, fontSize: 13,
                  background: "none",
                  border: "1px solid rgba(255,255,255,0.12)",
                  borderRadius: 8, padding: "12px 28px",
                  color: "rgba(255,255,255,0.45)",
                  textDecoration: "none",
                  display: "inline-flex", alignItems: "center", gap: 8,
                  transition: "border-color 0.2s, color 0.2s",
                }}
                onMouseEnter={e => { const a = e.currentTarget as HTMLAnchorElement; a.style.borderColor = "rgba(255,255,255,0.25)"; a.style.color = "rgba(255,255,255,0.8)"; }}
                onMouseLeave={e => { const a = e.currentTarget as HTMLAnchorElement; a.style.borderColor = "rgba(255,255,255,0.12)"; a.style.color = "rgba(255,255,255,0.45)"; }}
              >
                Join Telegram
              </a>
            </div>
          </Fade>
        </div>
      </section>

      <Divider />

      {/* ── FOOTER ─────────────────────────────────────────────────────────── */}
      <footer style={{ position: "relative", zIndex: 1, padding: "40px 24px" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>

          {/* Left: logo + name */}
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <ArsweepLogo className="w-6 h-6" />
            <span style={{ fontFamily: mono, fontSize: 12, color: T.muted, letterSpacing: "0.1em" }}>ARSWEEP</span>
          </div>

          {/* Center: links */}
          <div style={{ display: "flex", gap: 28, flexWrap: "wrap" }}>
            {[
              { label: "Docs",     to: "/docs"    },
              { label: "$ARSWP",  to: "/token"   },
              { label: "Agent",   to: "/agent"   },
              { label: "GitHub",  to: "https://github.com", external: true },
            ].map((item) =>
              item.external ? (
                <a key={item.label} href={item.to} target="_blank" rel="noopener noreferrer"
                  style={{ fontFamily: mono, fontSize: 11, color: T.dim, textDecoration: "none", letterSpacing: "0.06em", transition: "color 0.2s" }}
                  onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.color = "rgba(255,255,255,0.55)"; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.color = T.dim; }}
                >
                  {item.label}
                </a>
              ) : (
                <Link key={item.label} to={item.to}
                  style={{ fontFamily: mono, fontSize: 11, color: T.dim, textDecoration: "none", letterSpacing: "0.06em", transition: "color 0.2s" }}
                  onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.color = "rgba(255,255,255,0.55)"; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.color = T.dim; }}
                >
                  {item.label}
                </Link>
              )
            )}
          </div>

          {/* Right: copyright */}
          <span style={{ fontFamily: mono, fontSize: 11, color: T.dim, letterSpacing: "0.06em" }}>
            © {new Date().getFullYear()} Arsweep
          </span>
        </div>
      </footer>

    </div>
  );
};

export default Landing;
