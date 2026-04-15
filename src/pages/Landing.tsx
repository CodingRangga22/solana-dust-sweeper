import React, { useEffect, useRef, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Shield, Eye, Zap, CheckCircle2, Github, Crown, Loader2 } from "lucide-react";
import ArsweepLogo from "@/components/ArsweepLogo";
import ThemeToggle from "@/components/ThemeToggle";
import ChatWidget from "@/components/ChatWidget";
import { useBanner } from "@/components/BannerProvider";
import HeroDemo from "@/components/HeroDemo";
import LiveStatsSection from "@/components/LiveStatsSection";
import FAQSection from "@/components/landing/FAQSection";
import PremiumFooter from "@/components/PremiumFooter";
import BrandWordmark from "@/components/BrandWordmark";
import { useWallets } from "@privy-io/react-auth/solana";
import { PublicKey } from "@solana/web3.js";
import { useAswpAccess } from "@/hooks/useAswpAccess";


const YellowReveal = ({ children }: { children: React.ReactNode }) => {
  const ref = React.useRef<HTMLSpanElement>(null);
  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        el.style.color = entry.isIntersecting ? "var(--ar-yellow)" : "#FFFFFF";
      },
      { threshold: 0.5, rootMargin: "0px 0px -80px 0px" }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return <span ref={ref} style={{color:"#FFFFFF", transition:"color 0.6s ease"}}>{children}</span>;
};

const SOL_PER = 0.00203928;
const MAX_T = 200;
const MAX_P = 500;

const WORDS = ["dead accounts.", "ghost wallets.", "forgotten rent.", "locked SOL."];

const AnimatedWord = () => {
  const [idx, setIdx] = React.useState(0);
  const [visible, setVisible] = React.useState(true);

  React.useEffect(() => {
    const interval = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setIdx(i => (i + 1) % WORDS.length);
        setVisible(true);
      }, 400);
    }, 2800);
    return () => clearInterval(interval);
  }, []);

  return (
    <span style={{
      display: "block",
      color: "rgba(255,255,255,0.32)",
      opacity: visible ? 1 : 0,
      transform: visible ? "translateY(0)" : "translateY(8px)",
      transition: "opacity 0.4s ease, transform 0.4s ease",
    }}>
      {WORDS[idx]}
    </span>
  );
};


const Landing = () => {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = React.useState(false);
  const { bannerHeight } = useBanner();
  const { wallets } = useWallets();
  const walletAddress = wallets[0]?.address ?? null;
  const owner = useMemo(() => (walletAddress ? new PublicKey(walletAddress) : null), [walletAddress]);
  const aswp = useAswpAccess(owner);

  const [tokenAccounts, setTokenAccounts] = React.useState<number>(0);
  const [solPrice, setSolPrice] = React.useState<number>(130);

  // Global scroll reveal
  useEffect(() => {
    const style = document.createElement("style");
    style.textContent = `
      .sr { opacity: 0; transform: translateY(28px); transition: opacity 0.6s cubic-bezier(0.22,1,0.36,1), transform 0.6s cubic-bezier(0.22,1,0.36,1); }
      .sr.on { opacity: 1 !important; transform: none !important; }
    `;
    document.head.appendChild(style);

    const t = setTimeout(() => {
      const obs = new IntersectionObserver(entries => {
        entries.forEach(e => {
          if (e.isIntersecting) { e.target.classList.add("on"); obs.unobserve(e.target); }
        });
      }, { threshold: 0.08, rootMargin: "0px 0px -40px 0px" });

      const hero = document.getElementById("landing-hero");
      document.querySelectorAll("section h2, section h3, section p, .ar-fade-in").forEach((el, i) => {
        if (hero?.contains(el)) return;
        el.classList.add("sr");
        (el as HTMLElement).style.transitionDelay = `${(i % 5) * 0.1}s`;
        obs.observe(el);
      });
    }, 500);

    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    void aswp.refresh();
  }, [owner]); // eslint-disable-line react-hooks/exhaustive-deps


  const solLocked = tokenAccounts * SOL_PER;
  const usdValue = solLocked * solPrice;
  const pct = Math.min((tokenAccounts / MAX_T) * 100, 100);

  const M:React.CSSProperties = {fontFamily:"var(--font-mono)"};
  const D6:React.CSSProperties = {height:1,background:"rgba(255,255,255,0.06)"};
  const BP:React.CSSProperties = {fontFamily:"var(--font-mono)",fontSize:13,fontWeight:600,color:"#0a0a0a",background:"linear-gradient(180deg,#ffffff 0%,#f0f0f0 100%)",border:"1px solid rgba(255,255,255,0.35)",borderRadius:10,padding:"12px 24px",cursor:"pointer",display:"inline-flex",alignItems:"center",gap:8,transition:"opacity 0.2s, box-shadow 0.2s, transform 0.2s",boxShadow:"0 4px 24px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.85)"};
  const BG:React.CSSProperties = {fontFamily:"var(--font-mono)",fontSize:13,color:"rgba(255,255,255,0.45)",background:"none",border:"1px solid rgba(255,255,255,0.12)",borderRadius:8,padding:"12px 24px",cursor:"pointer",transition:"border-color 0.2s,color 0.2s"};
  const INP:React.CSSProperties = {fontFamily:"var(--font-mono)",width:64,fontSize:13,padding:"6px 10px",textAlign:"center",background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.08)",borderRadius:6,color:"#FFFFFF",outline:"none"};

  return (
    <div className="arsweep-page-shell font-sans antialiased">
      <header className="arsweep-premium-nav relative" style={{position:"fixed",left:0,right:0,zIndex:50,top:bannerHeight}}>
        <div style={{maxWidth:1280,margin:"0 auto",padding:"0 24px",height:64,display:"flex",alignItems:"center",justifyContent:"space-between"}}>
          <div style={{display:"flex",alignItems:"center",gap:8}}>
            <button className="sm:hidden" onClick={()=>setMenuOpen(p=>!p)} style={{background:"none",border:"none",color:"rgba(255,255,255,0.6)",cursor:"pointer",padding:6}}>
              {menuOpen ? <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/></svg> : <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16"/></svg>}
            </button>
            <div style={{display:"flex",alignItems:"center",gap:10,cursor:"pointer"}} onClick={()=>navigate("/")}>
              <ArsweepLogo className="h-7 w-7 shrink-0" />
              <BrandWordmark />
            </div>
          </div>
          <nav className="hidden sm:flex absolute left-1/2 -translate-x-1/2 items-center gap-0.5" aria-label="Main">
            {[["Docs","/docs"],["Token","/token"],["Agent","/agent"],["x402","/x402"]].map(([l,p])=>(
              <button key={p} type="button" onClick={()=>navigate(p)}
                className="rounded-full px-3.5 py-2 text-[13px] font-medium text-white/70 hover:text-white hover:bg-white/[0.08] transition-colors duration-200 bg-transparent border-none cursor-pointer"
              >{l}</button>
            ))}
          </nav>
          <div className="flex items-center gap-2 shrink-0">
            <div
              className="hidden sm:inline-flex items-center gap-2 rounded-full border border-white/[0.10] bg-white/[0.04] px-3 py-2 text-[11px] font-semibold text-white/70 shadow-[0_10px_30px_rgba(0,0,0,0.45)] backdrop-blur-xl"
              style={M}
              title="ASWP holder status"
            >
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-white/[0.14] to-white/[0.05] ring-1 ring-white/[0.12]">
                <Crown className="h-3.5 w-3.5 text-white/80" strokeWidth={1.7} />
              </span>
              {aswp.loading ? (
                <span className="inline-flex items-center gap-2 text-white/55">
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Checking…
                </span>
              ) : owner && (aswp.aswpUiAmount ?? 0) > 0 ? (
                <span className="text-white/85">
                  <span className="mr-1 rounded-md bg-white/[0.08] px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.14em] text-white/80 ring-1 ring-white/[0.12]">
                    ASWP
                  </span>
                  Holder
                </span>
              ) : (
                <span className="text-white/55">Not Holder</span>
              )}
            </div>
            <button type="button" onClick={()=>navigate("/app")} className="ar-btn-primary">Launch App</button>
          </div>
        </div>
        {menuOpen && (
          <div className="sm:hidden" style={{background:"rgba(4,5,6,0.98)",backdropFilter:"blur(20px)",borderBottom:"1px solid rgba(255,255,255,0.08)",padding:"8px 16px 16px"}}>
            <div style={{display:"flex",gap:8,marginBottom:12}}>
              <button type="button" onClick={()=>{ navigate("/app"); setMenuOpen(false); }} className="ar-btn-primary w-full flex-1">Launch App</button>
            </div>
            {[["Agent","/agent"],["x402","/x402"],["Token","/token"],["Watch Demo","/demo"],["Simulation","/simulation"],["Docs","/docs"],["Telegram","https://t.me/arsweepalert"]].map(([l,p])=>(
              <span key={p} onClick={()=>{p.startsWith("http")?window.open(p,"_blank"):navigate(p);setMenuOpen(false);}}
                style={{fontSize:14,color:"rgba(255,255,255,0.7)",cursor:"pointer",padding:"12px 8px",borderBottom:"1px solid rgba(255,255,255,0.06)",display:"block"}}
              >{l}</span>
            ))}
            <div style={{paddingTop:12,display:"flex",alignItems:"center",justifyContent:"space-between"}}>
              <span style={{fontSize:13,color:"rgba(255,255,255,0.4)"}}>Theme</span>
              <ThemeToggle />
            </div>
          </div>
        )}
      </header>

      <div className="arsweep-dot-grid" aria-hidden />
      <div className="arsweep-vignette-fade" aria-hidden />

      {/* Noise */}
      <div style={{position:"fixed",inset:0,zIndex:0,pointerEvents:"none",backgroundImage:`url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,backgroundSize:"200px",opacity:0.028,mixBlendMode:"overlay"}} />

      {/* NAV */}

      {/* HERO */}
      <section
        id="landing-hero"
        className="relative z-[2]"
      >
        <div className="ar-container grid items-center gap-10 pb-16 pt-24 sm:gap-12 sm:pb-24 sm:pt-28 md:grid-cols-[minmax(0,1fr)_minmax(280px,520px)] md:gap-14">
          <div className="min-w-0 text-left">
            <div className="surface-premium mb-8 inline-flex items-center gap-2 rounded-full px-4 py-2 shadow-premium-sm sm:mb-10" style={{...M,fontSize:12,color:"rgba(255,255,255,0.78)"}}>
              <span className="h-1.5 w-1.5 rounded-full bg-white shadow-[0_0_12px_rgba(255,255,255,0.35)]" />
              Mainnet is live — sweep your wallet now
            </div>

            <h1 className="ar-h1 mb-6">
              Reclaim <YellowReveal>SOL</YellowReveal>
              <span className="mt-2 block text-white/55">locked in your</span>
              <AnimatedWord />
            </h1>

            <p className="ar-subtitle mb-10 max-w-[36rem]">
              Every token interaction leaves empty accounts locking{" "}
              <span className="font-semibold text-white">~0.002 SOL</span>{" "}
              in rent. Arsweep closes them safely, on-chain, in minutes.
            </p>

            <div className="mb-10 flex flex-wrap gap-3">
              <button className="ar-btn-primary" onClick={()=>navigate("/app")}>
                Launch App
                <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M2 6.5h9M7.5 3l3.5 3.5L7.5 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
              </button>
              <button type="button" className="ar-btn-secondary" onClick={()=>navigate("/agent")}>
                Launch Agent
                <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M2 6.5h9M7.5 3l3.5 3.5L7.5 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
              </button>
              <button className="ar-btn-ghost" onClick={()=>navigate("/docs")}>Read docs</button>
            </div>

            <div className="flex flex-wrap gap-6 border-t border-white/[0.06] pt-8">
              {[{v:"~0.002 SOL",l:"per account"},{v:"< 5 sec",l:"to scan"},{v:"0",l:"private keys seen"}].map(({v,l})=>(
                <div key={l}>
                  <div className="text-lg font-bold tracking-tight text-white sm:text-xl">{v}</div>
                  <div className="mt-1 text-[11px] uppercase tracking-[0.08em] text-white/50" style={M}>{l}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-[min(100%,560px)] md:mx-0">
            <div
              className="pointer-events-none absolute left-1/2 top-1/2 aspect-square w-[min(120%,720px)] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle_at_50%_48%,rgba(255,255,255,0.09),transparent_60%)] blur-2xl"
              aria-hidden
            />
            <div className="relative z-10 mx-auto flex aspect-square w-full max-w-[560px] items-center justify-center overflow-visible">
              <HeroDemo />
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto h-px max-w-4xl bg-gradient-to-r from-transparent via-white/10 to-transparent" aria-hidden />

      {/* HOW IT WORKS */}
      <section className="ar-section scroll-mt-28">
        <div className="ar-container text-center">
          <p className="ar-section-kicker mb-3">Product</p>
          <h2 className="ar-landing-section-title" style={{fontSize:"clamp(32px,5vw,52px)",marginBottom:12}}>How It <YellowReveal>Works</YellowReveal></h2>
          <p className="mx-auto mb-12 max-w-lg text-base text-white/50 sm:mb-16">Three steps. Under three minutes.</p>
          <div className="grid gap-px overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.06] sm:grid-cols-2 lg:grid-cols-3">
            {[
              {icon:<Shield size={18} style={{color:"rgba(255,255,255,0.6)"}}/>,n:"01",t:"Connect — we only look, not touch",d:"Read-only scan first. We identify your token accounts without touching a single lamport."},
              {icon:<Eye size={18} style={{color:"rgba(255,255,255,0.6)"}}/>,n:"02",t:"We find what's been quietly draining you",d:"Every empty account, exact SOL locked, sorted by reclaim value. The number is right there."},
              {icon:<Zap size={18} style={{color:"rgba(255,255,255,0.6)"}}/>,n:"03",t:"You approve. SOL lands back. Done.",d:"One transaction. You sign it. SOL refunded directly to your wallet in seconds."},
            ].map(({icon,n,t,d})=>(
              <div
                key={n}
                className="ar-fade-in group bg-[rgba(6,9,11,0.94)] p-9 text-left transition-colors hover:bg-[rgba(10,14,16,0.98)]"
              >
                <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:24}}>
                  <div style={{width:40,height:40,borderRadius:10,background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.08)",display:"flex",alignItems:"center",justifyContent:"center"}}>{icon}</div>
                  <span style={{...M,fontSize:11,color:"rgba(255,255,255,0.2)"}}>{n}</span>
                </div>
                <h3 style={{fontSize:17,fontWeight:600,color:"#FFFFFF",marginBottom:10,lineHeight:1.4}}>{t}</h3>
                <p style={{fontSize:14,color:"rgba(255,255,255,0.45)",lineHeight:1.75,textAlign:"justify"}}>{d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div style={D6} />

      {/* LIVE STATS */}
      <LiveStatsSection />

      <div style={{height:1,background:"rgba(255,255,255,0.06)"}} />

      {/* SOCIAL PROOF */}
      <section className="ar-section">
        <div className="ar-container">
          <div className="surface-premium rounded-2xl px-6 py-7 sm:px-10 sm:py-8">
            <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
              <div className="min-w-0">
                <p className="ar-section-kicker mb-2">Trusted flow</p>
                <h3 className="text-[18px] font-semibold tracking-[-0.01em] text-white sm:text-[20px]">
                  Built for real wallets, not demos
                </h3>
                <p className="mt-2 max-w-[44rem] text-[14px] leading-relaxed text-white/50">
                  Non-custodial. Read-only scan first. You approve every transaction.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {[
                  "Wallet Adapter",
                  "Privy",
                  "Jupiter",
                  "Helius",
                  "Solana",
                ].map((label) => (
                  <span
                    key={label}
                    className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-white/55"
                    style={M}
                  >
                    {label}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* WHAT IS ARSWEEP */}
      <section className="ar-section">
        <div className="ar-container text-center">
          <p className="ar-section-kicker mb-3">Why it exists</p>
          <h2 className="ar-landing-section-title" style={{fontSize:"clamp(32px,5vw,52px)",marginBottom:12}}>
            What is <YellowReveal>Arsweep</YellowReveal>
          </h2>
          <p className="mx-auto mb-12 max-w-[46rem] text-[16px] leading-relaxed text-white/50 sm:mb-16">
            Every time you interact with a token on Solana, an empty account is left behind. Each one locks ~0.002 SOL in rent indefinitely. Arsweep finds them all and closes them — returning your SOL instantly, non-custodially, on-chain.
          </p>
          <div className="grid gap-px overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.06] text-left sm:grid-cols-2 lg:grid-cols-6">
            {[
              {icon:"◈",t:"Dust Account Scanner",d:"Automatically detects all empty token accounts in your wallet — regardless of how many tokens you have interacted with."},
              {icon:"⬡",t:"SOL Rent Reclaimer",d:"Closes selected accounts and refunds the locked rent deposit directly to your wallet. No middleman, no custody."},
              {icon:"⟳",t:"Batch Processing",d:"Close up to 27 accounts in a single transaction. Efficient, fast, and minimizes the number of approvals needed."},
              {icon:"◎",t:"Non-Custodial",d:"We never hold your assets or request your private key. Every transaction is signed by you, in your wallet."},
              {icon:"◈",t:"Fully On-Chain",d:"Every sweep operation is a verifiable Solana transaction. Transparent, permanent, and auditable by anyone."},
              
            ].map(({icon,t,d}, idx, arr)=>(
              <div
                key={t}
                className={`ar-fade-in group bg-[rgba(6,9,11,0.94)] p-9 transition-colors hover:bg-[rgba(10,14,16,0.98)] lg:col-span-2 ${arr.length === 5 && idx >= 3 ? "lg:col-span-3" : ""}`}
              >
                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 10,
                    background: "rgba(255,255,255,0.05)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 18,
                    color: "rgba(255,255,255,0.5)",
                    margin: "0 auto 20px",
                  }}
                >
                  {icon}
                </div>
                <h3 style={{fontSize:16,fontWeight:600,color:"#FFFFFF",marginBottom:10,lineHeight:1.4,textAlign:"center"}}>{t}</h3>
                <p style={{fontSize:14,color:"rgba(255,255,255,0.45)",lineHeight:1.75}}>{d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div style={{height:1,background:"rgba(255,255,255,0.06)"}} />

      {/* SOL CALCULATOR */}
      <section style={{position:"relative",zIndex:2,padding:"80px clamp(16px, 5vw, 40px)",background:"rgba(255,255,255,0.015)"}}>
        <div style={{maxWidth:1100,margin:"0 auto"}}>
          <div style={{textAlign:"center",marginBottom:64}}>
            <h2 className="ar-landing-section-title" style={{fontSize:"clamp(28px,4vw,48px)",marginBottom:12}}>SOL <YellowReveal>Calculator</YellowReveal></h2>
            <p style={{fontSize:16,color:"rgba(255,255,255,0.4)",lineHeight:1.6}}>How much are you leaving behind?</p>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit, minmax(280px, 1fr))",gap:32}}>
            <div>
              <div style={{display:"flex",flexDirection:"column",gap:20}}>
                <div>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
                    <span style={{fontFamily:"var(--font-mono)",fontSize:12,color:"rgba(255,255,255,0.4)"}}>Token accounts</span>
                    <div style={{display:"flex",gap:6}}>
                      {[25,50,100].map((pctLabel) => {
                        const isActive = Math.round((tokenAccounts / MAX_T) * 100) === pctLabel;
                        return (
                          <button
                            key={pctLabel}
                            type="button"
                            onClick={() => setTokenAccounts(Math.round((pctLabel / 100) * MAX_T))}
                            style={{
                              fontFamily:"var(--font-mono)",
                              fontSize:11,
                              color:isActive ? "#FFFFFF" : "rgba(255,255,255,0.35)",
                              background:"rgba(255,255,255,0.04)",
                              border:"1px solid rgba(255,255,255,0.08)",
                              borderRadius:5,
                              padding:"4px 10px",
                              cursor:"pointer",
                            }}
                          >
                            {pctLabel === 100 ? "MAX" : `${pctLabel}%`}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                  <div style={{display:"flex",alignItems:"center",gap:12}}>
                    <input
                      type="range"
                      min={0}
                      max={MAX_T}
                      value={tokenAccounts}
                      step={1}
                      onChange={(e) => setTokenAccounts(Math.max(0, Math.min(MAX_T, Number(e.target.value) || 0)))}
                      style={{flex:1,height:2,appearance:"none",WebkitAppearance:"none",background:"rgba(255,255,255,0.12)",borderRadius:2,cursor:"pointer",outline:"none",border:"none",accentColor:"#FFFFFF"}}
                    />
                    <input
                      type="number"
                      min={0}
                      max={MAX_T}
                      value={tokenAccounts}
                      onChange={(e) => setTokenAccounts(Math.max(0, Math.min(MAX_T, Number(e.target.value) || 0)))}
                      style={INP}
                    />
                  </div>
                </div>

                <div>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
                    <span style={{fontFamily:"var(--font-mono)",fontSize:12,color:"rgba(255,255,255,0.4)"}}>SOL price (USD)</span>
                    <div style={{display:"flex",gap:6}}>
                      {[80,130,500].map((v) => {
                        const isActive = solPrice === v;
                        return (
                          <button
                            key={v}
                            type="button"
                            onClick={() => setSolPrice(v)}
                            style={{
                              fontFamily:"var(--font-mono)",
                              fontSize:11,
                              color:isActive ? "#FFFFFF" : "rgba(255,255,255,0.35)",
                              background:"rgba(255,255,255,0.04)",
                              border:"1px solid rgba(255,255,255,0.08)",
                              borderRadius:5,
                              padding:"4px 10px",
                              cursor:"pointer",
                            }}
                          >
                            ${v}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                  <div style={{display:"flex",alignItems:"center",gap:12}}>
                    <input
                      type="range"
                      min={0}
                      max={MAX_P}
                      value={solPrice}
                      step={1}
                      onChange={(e) => setSolPrice(Math.max(0, Math.min(MAX_P, Number(e.target.value) || 0)))}
                      style={{flex:1,height:2,appearance:"none",WebkitAppearance:"none",background:"rgba(255,255,255,0.12)",borderRadius:2,cursor:"pointer",outline:"none",border:"none",accentColor:"#FFFFFF"}}
                    />
                    <input
                      type="number"
                      min={0}
                      max={MAX_P}
                      value={solPrice}
                      onChange={(e) => setSolPrice(Math.max(0, Math.min(MAX_P, Number(e.target.value) || 0)))}
                      style={INP}
                    />
                  </div>
                </div>
              </div>
              <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:1,marginTop:28,background:"rgba(255,255,255,0.06)",borderRadius:10,overflow:"hidden"}}>
                {[
                  {value: tokenAccounts.toString(), l:"accounts"},
                  {value: solLocked.toFixed(4), l:"SOL locked"},
                  {value: `$${usdValue.toFixed(2)}`, l:"USD value"},
                ].map(({value,l})=>(
                  <div key={l} style={{textAlign:"center",padding:"14px 10px",background:"rgba(6,9,11,0.72)"}}>
                    <span style={{fontSize:18,fontWeight:700,color:"#FFFFFF",display:"block",marginBottom:3}}>{value}</span>
                    <span style={{fontFamily:"var(--font-mono)",fontSize:10,color:"rgba(255,255,255,0.3)",textTransform:"uppercase",letterSpacing:"0.08em"}}>{l}</span>
                  </div>
                ))}
              </div>
            </div>
            <div style={{background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.07)",borderRadius:16,padding:36,display:"flex",flexDirection:"column",justifyContent:"center"}}>
              <div style={{fontFamily:"var(--font-mono)",fontSize:11,color:"rgba(255,255,255,0.3)",letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:12}}>Estimated recoverable</div>
              <span style={{fontSize:64,fontWeight:800,color:tokenAccounts>100?"var(--ar-yellow)":"#FFFFFF",lineHeight:1,letterSpacing:"-0.03em",display:"block",marginBottom:6,transition:"color 0.3s"}}>{solLocked.toFixed(4)}</span>
              <span style={{fontFamily:"var(--font-mono)",fontSize:13,color:"rgba(255,255,255,0.35)"}}>{`approx. $${usdValue.toFixed(2)} USD`}</span>
              <div style={{marginTop:24,height:2,background:"rgba(255,255,255,0.08)",borderRadius:2,overflow:"visible"}}>
                <div style={{height:"100%",borderRadius:2,background:"linear-gradient(90deg, rgba(255,255,255,0.85), rgba(200,200,200,0.65))",width:`${pct}%`,transition:"width 0.3s ease",position:"relative"}}>
                  <span style={{position:"absolute",right:-4,top:-3,width:8,height:8,background:"#ffffff",borderRadius:"50%",boxShadow:"0 0 10px rgba(255,255,255,0.35)",display:"block"}} />
                </div>
              </div>
              <button onClick={()=>navigate("/app")} style={{...BP,marginTop:28,justifyContent:"center"}}
                onMouseEnter={e=>(e.currentTarget.style.opacity="0.85")}
                onMouseLeave={e=>(e.currentTarget.style.opacity="1")}
              >Reclaim my SOL now</button>
            </div>
          </div>
        </div>
      </section>

      <div style={{height:1,background:"rgba(255,255,255,0.06)"}} />

      {/* SECURITY */}
      <section className="ar-section">
        <div className="ar-container text-center">
          <p className="ar-section-kicker mb-3">Security</p>
          <h2 className="ar-landing-section-title" style={{fontSize:"clamp(28px,4vw,48px)",marginBottom:12}}>Your keys never leave your wallet.</h2>
          <p className="mx-auto mb-12 max-w-[42rem] text-[16px] leading-relaxed text-white/50 sm:mb-16">
            Arsweep never asks for seed phrases. Everything is client-side and signed by you.
          </p>
          <div className="grid gap-px overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.06] text-left sm:grid-cols-2 lg:grid-cols-3">
            {[
              {icon:<Shield size={18} style={{color:"rgba(255,255,255,0.6)"}}/>,t:"Non-custodial",d:"We never store or access your private keys. Ever."},
              {icon:<Eye size={18} style={{color:"rgba(255,255,255,0.6)"}}/>,t:"Open source",d:"Full codebase is public. Read every line before you use it."},
              {icon:<CheckCircle2 size={18} style={{color:"rgba(255,255,255,0.6)"}}/>,t:"On-chain verifiable",d:"Every sweep transaction is permanent and publicly verifiable."},
            ].map(({icon,t,d})=>(
              <div key={t} className="ar-fade-in bg-[rgba(6,9,11,0.94)] p-9 transition-colors hover:bg-[rgba(10,14,16,0.98)]">
                <div style={{width:40,height:40,borderRadius:10,background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.1)",display:"flex",alignItems:"center",justifyContent:"center",marginBottom:20}}>{icon}</div>
                <h3 style={{fontSize:17,fontWeight:600,color:"#FFFFFF",marginBottom:10,lineHeight:1.4}}>{t}</h3>
                <p style={{fontSize:14,color:"rgba(255,255,255,0.45)",lineHeight:1.75}}>{d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div style={{height:1,background:"rgba(255,255,255,0.06)"}} />

      {/* ROADMAP */}
      <section className="ar-section">
        <div className="ar-container">
          <div style={{textAlign:"center",marginBottom:72}}>
            <h2 className="ar-landing-section-title" style={{fontSize:"clamp(32px,5vw,52px)",marginBottom:12}}>Road<YellowReveal>map</YellowReveal></h2>
            <p style={{fontSize:16,color:"rgba(255,255,255,0.4)",lineHeight:1.6}}>From dust sweeper to complete Solana wallet management suite.</p>
          </div>
          <div className="surface-premium rounded-2xl px-7 py-6" style={{marginBottom:48}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
              <span style={{fontSize:14,color:"#FFFFFF",fontWeight:500}}>Overall Progress</span>
              <span style={{fontFamily:"var(--font-mono)",fontSize:13,color:"var(--ar-teal)"}}>3 / 10 Milestones</span>
            </div>
            <div style={{height:3,background:"rgba(255,255,255,0.08)",borderRadius:2,overflow:"hidden"}}>
              <div style={{width:"30%",height:"100%",background:"var(--ar-teal)",borderRadius:2}} />
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {s:"COMPLETED",sc:"var(--ar-teal)",sb:"var(--ar-teal-soft)",bc:"var(--ar-teal-ring)",t:"Devnet Testing",d:"Program deployed and tested end-to-end. Jupiter API integrated. 100+ test sweeps completed."},
              {s:"COMPLETED",sc:"var(--ar-teal)",sb:"var(--ar-teal-soft)",bc:"var(--ar-teal-ring)",t:"Mainnet Launch",d:"Full mainnet deployment complete. Real SOL sweeping live. Treasury accumulating fees."},
              {s:"IN PROGRESS",sc:"rgba(255,255,255,0.6)",sb:"rgba(255,255,255,0.05)",bc:"rgba(255,255,255,0.15)",t:"Community Building",d:"Growing Telegram and X community. Building awareness before token launch. Target: 500+ members."},
              
              {s:"LIVE NOW",sc:"var(--ar-teal)",sb:"var(--ar-teal-soft)",bc:"var(--ar-teal-ring)",t:"$ASWP Token Launch",d:"$ASWP token is now launching on Pump.fun. Community members get early access and rewards."},
              {s:"Q2 2026",sc:"rgba(255,255,255,0.3)",sb:"transparent",bc:"rgba(255,255,255,0.07)",t:"AI Wallet Hygiene Agent",d:"AI-powered agent that analyzes your wallet, detects dust and spam tokens automatically."},
              {s:"Q3 2026",sc:"rgba(255,255,255,0.3)",sb:"transparent",bc:"rgba(255,255,255,0.07)",t:"Cross-Chain Swap",d:"Seamlessly swap tokens across multiple chains directly from Arsweep."},
              {s:"Q3 2026",sc:"rgba(255,255,255,0.3)",sb:"transparent",bc:"rgba(255,255,255,0.07)",t:"Vault & Earn",d:"Put your reclaimed SOL to work. Deposit into vaults and earn yield automatically."},
              {s:"Q4 2026",sc:"rgba(255,255,255,0.25)",sb:"transparent",bc:"rgba(255,255,255,0.06)",t:"Staking & Rewards",d:"Stake SOL directly from Arsweep. Earn staking rewards while keeping full control."},
              {s:"FUTURE",sc:"rgba(255,255,255,0.2)",sb:"transparent",bc:"rgba(255,255,255,0.05)",t:"Multi-Chain Expansion",d:"Expanding beyond Solana. Dust sweeping and earn features across all major chains."},
            ].map(({s,sc,sb,bc,t,d})=>(
              <div key={t} className="ar-fade-in rounded-2xl border bg-white/[0.02] p-7 transition-colors hover:bg-white/[0.04]" style={{borderColor: bc}}>
                <div style={{display:"flex",justifyContent:"flex-end",marginBottom:16}}>
                  <span style={{fontFamily:"var(--font-mono)",fontSize:10,color:sc,background:sb,border:`1px solid ${bc}`,borderRadius:999,padding:"3px 10px",letterSpacing:"0.08em"}}>{s}</span>
                </div>
                <h3 style={{fontSize:15,fontWeight:600,color:"#FFFFFF",marginBottom:8,lineHeight:1.4}}>{t}</h3>
                <p style={{fontSize:13,color:"rgba(255,255,255,0.4)",lineHeight:1.7}}>{d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div style={{height:1,background:"rgba(255,255,255,0.06)"}} />

      {/* CTA */}
      <section className="ar-section" style={{background:"rgba(255,255,255,0.015)"}}>
        <div className="ar-container">
          <div className="mx-auto max-w-[720px] text-center">
          <h2 className="ar-landing-section-title" style={{fontSize:"clamp(32px,5vw,60px)",marginBottom:20,lineHeight:1.04}}>
            Your SOL is already{" "}
            <YellowReveal>yours.</YellowReveal>
          </h2>
          <p style={{fontSize:17,color:"rgba(255,255,255,0.4)",lineHeight:1.7,marginBottom:44}}>
            No email. No signup. Connect wallet, scan, done. Your SOL back in under 3 minutes.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <button onClick={()=>navigate("/app")} className="ar-btn-primary">
              Scan my wallet
              <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M2 6.5h9M7.5 3l3.5 3.5L7.5 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
            </button>
            <button onClick={()=>window.open("https://t.me/arsweepalert","_blank")} className="ar-btn-secondary">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.447 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.12L7.17 13.857l-2.96-.924c-.643-.204-.657-.643.136-.953l11.57-4.461c.537-.194 1.006.131.978.702z"/></svg>
              Join Telegram
            </button>
          </div>
          </div>
        </div>
      </section>

      <div style={{height:1,background:"rgba(255,255,255,0.06)"}} />

      <FAQSection />
      <PremiumFooter />

      <ChatWidget />
    </div>
  );
};

export default Landing;
