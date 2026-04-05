import React, { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Shield, Eye, Zap, CheckCircle2, Github } from "lucide-react";
import ArsweepLogo from "@/components/ArsweepLogo";
import ThemeToggle from "@/components/ThemeToggle";
import ChatWidget from "@/components/ChatWidget";
import { useBanner } from "@/components/BannerProvider";
import HeroDemo from "@/components/HeroDemo";
import LiveStatsSection from "@/components/LiveStatsSection";


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
      color: "rgba(255,255,255,0.18)",
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
  const { bannerHeight } = useBanner();

  const tSRef = useRef<HTMLInputElement>(null);
  const tNRef = useRef<HTMLInputElement>(null);
  const pSRef = useRef<HTMLInputElement>(null);
  const pNRef = useRef<HTMLInputElement>(null);
  const solRef = useRef<HTMLSpanElement>(null);
  const usdRef = useRef<HTMLSpanElement>(null);
  const barRef = useRef<HTMLDivElement>(null);
  const bdARef = useRef<HTMLSpanElement>(null);
  const bdSRef = useRef<HTMLSpanElement>(null);
  const bdURef = useRef<HTMLSpanElement>(null);

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

      document.querySelectorAll("section h2, section h3, section p, .ar-fade-in").forEach((el, i) => {
        el.classList.add("sr");
        (el as HTMLElement).style.transitionDelay = `${(i % 5) * 0.1}s`;
        obs.observe(el);
      });
    }, 500);

    return () => clearTimeout(t);
  }, []);


  const calc = () => {
    const t = parseInt(tNRef.current?.value||"0")||0;
    const p = parseFloat(pNRef.current?.value||"0")||0;
    const sol = t * SOL_PER;
    const usd = sol * p;
    const pct = Math.min((t/MAX_T)*100,100);
    if (solRef.current) { solRef.current.textContent = sol.toFixed(4); solRef.current.style.color = t>100?"var(--ar-yellow)":"#FFFFFF"; }
    if (usdRef.current) usdRef.current.textContent = "approx. $"+usd.toFixed(2)+" USD";
    if (barRef.current) barRef.current.style.width = pct+"%";
    if (bdARef.current) bdARef.current.textContent = String(t);
    if (bdSRef.current) bdSRef.current.textContent = sol.toFixed(4);
    if (bdURef.current) bdURef.current.textContent = "$"+usd.toFixed(2);
  };

  const clearP = (f:string) => document.querySelectorAll(`[data-f="${f}"]`).forEach(b=>b.classList.remove("ar5-on"));

  useEffect(()=>{
    const sync = (s:React.RefObject<HTMLInputElement>, n:React.RefObject<HTMLInputElement>, f:string, max:number) => {
      s.current?.addEventListener("input",()=>{ if(n.current) n.current.value=s.current!.value; clearP(f); calc(); });
      n.current?.addEventListener("input",()=>{ const v=Math.max(0,Math.min(parseInt(n.current!.value)||0,max)); if(s.current) s.current.value=String(v); n.current!.value=String(v); clearP(f); calc(); });
    };
    sync(tSRef,tNRef,"t",MAX_T);
    sync(pSRef,pNRef,"p",MAX_P);
    document.querySelectorAll(".ar5-preset").forEach(btn=>{
      btn.addEventListener("click",()=>{
        const el=btn as HTMLElement;
        const f=el.dataset.f!; const pc=el.dataset.pc; const pv=el.dataset.pv;
        document.querySelectorAll(`[data-f="${f}"]`).forEach(b=>b.classList.remove("ar5-on"));
        btn.classList.add("ar5-on");
        if(f==="t"&&pc){ const v=Math.round(parseInt(pc)/100*MAX_T); if(tSRef.current) tSRef.current.value=String(v); if(tNRef.current) tNRef.current.value=String(v); }
        if(f==="p"&&pv){ if(pSRef.current) pSRef.current.value=pv; if(pNRef.current) pNRef.current.value=pv; }
        calc();
      });
    });
    calc();
  },[]);

  const M:React.CSSProperties = {fontFamily:"var(--font-mono)"};
  const D6:React.CSSProperties = {height:1,background:"rgba(255,255,255,0.06)"};
  const BP:React.CSSProperties = {fontFamily:"var(--font-mono)",fontSize:13,fontWeight:500,color:"#0B0F14",background:"#FFFFFF",border:"none",borderRadius:8,padding:"12px 24px",cursor:"pointer",display:"inline-flex",alignItems:"center",gap:8,transition:"opacity 0.2s"};
  const BG:React.CSSProperties = {fontFamily:"var(--font-mono)",fontSize:13,color:"rgba(255,255,255,0.45)",background:"none",border:"1px solid rgba(255,255,255,0.12)",borderRadius:8,padding:"12px 24px",cursor:"pointer",transition:"border-color 0.2s,color 0.2s"};
  const INP:React.CSSProperties = {fontFamily:"var(--font-mono)",width:64,fontSize:13,padding:"6px 10px",textAlign:"center",background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.08)",borderRadius:6,color:"#FFFFFF",outline:"none"};

  return (
    <div style={{minHeight:"100vh",background:"var(--ar-base)",backgroundImage:"radial-gradient(ellipse at 25% 40%, rgba(255,215,0,0.05), transparent 45%), radial-gradient(ellipse at 75% 60%, rgba(255,120,73,0.05), transparent 50%)",position:"relative",overflowX:"hidden",fontFamily:"'Inter',sans-serif",color:"#FFFFFF"}}>

      {/* Dot grid */}
      <div style={{position:"fixed",inset:0,zIndex:0,pointerEvents:"none",backgroundImage:"radial-gradient(circle, rgba(255,255,255,0.06) 1px, transparent 1px)",backgroundSize:"28px 28px",maskImage:"radial-gradient(ellipse at center, black 30%, transparent 80%)",WebkitMaskImage:"radial-gradient(ellipse at center, black 30%, transparent 80%)"}} />

      {/* Noise */}
      <div style={{position:"fixed",inset:0,zIndex:0,pointerEvents:"none",backgroundImage:`url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,backgroundSize:"200px",opacity:0.028,mixBlendMode:"overlay"}} />

      {/* NAV */}
      <header style={{position:"fixed",left:0,right:0,zIndex:50,top:0,borderBottom:"1px solid rgba(255,255,255,0.05)",background:"rgba(11,15,20,0.85)",backdropFilter:"blur(20px)"}}>
        <div style={{maxWidth:1200,margin:"0 auto",padding:"0 32px",height:56,display:"flex",alignItems:"center",justifyContent:"space-between"}}>
          <div style={{display:"flex",alignItems:"center",gap:10,cursor:"pointer"}} onClick={()=>navigate("/")}>
            <ArsweepLogo className="w-6 h-6" />
            <span style={{...M,fontSize:14,fontWeight:600,color:"#FFFFFF",letterSpacing:"0.06em",textTransform:"uppercase"}}>ARSWEEP</span>
          </div>
          <div style={{display:"flex",alignItems:"center",gap:28}}>
            {[["Docs","/docs"],["$ARSWP","/token"],["Agent","/agent"]].map(([l,p])=>(
              <span key={p} onClick={()=>navigate(p)} style={{fontSize:14,color:"rgba(255,255,255,0.5)",cursor:"pointer",transition:"color 0.2s"}}
                onMouseEnter={e=>(e.currentTarget.style.color="#FFFFFF")}
                onMouseLeave={e=>(e.currentTarget.style.color="rgba(255,255,255,0.5)")}
              >{l}</span>
            ))}
          </div>
          <div style={{display:"flex",alignItems:"center",gap:12}}>
            <ThemeToggle />
            <button onClick={()=>navigate("/app")} style={{fontSize:14,color:"#FFFFFF",background:"rgba(255,255,255,0.08)",border:"1px solid rgba(255,255,255,0.12)",borderRadius:8,padding:"7px 18px",cursor:"pointer",transition:"background 0.2s"}}
              onMouseEnter={e=>(e.currentTarget.style.background="rgba(255,255,255,0.13)")}
              onMouseLeave={e=>(e.currentTarget.style.background="rgba(255,255,255,0.08)")}
            >Launch App</button>
          </div>
        </div>
      </header>

      {/* HERO */}
      <section style={{position:"relative",zIndex:2,paddingTop:"100px",paddingBottom:100,maxWidth:1200,margin:"0 auto",padding:"100px 48px 100px",display:"grid",gridTemplateColumns:"1fr 1fr",gap:64,alignItems:"center"}}>
        <div>
          <div style={{...M,fontSize:12,color:"rgba(255,255,255,0.65)",border:"1px solid rgba(255,255,255,0.10)",background:"rgba(255,255,255,0.04)",borderRadius:999,padding:"5px 16px",marginBottom:36,display:"inline-flex",alignItems:"center",gap:8}}>
            <span style={{width:6,height:6,borderRadius:"50%",background:"var(--ar-teal)",display:"inline-block",boxShadow:"0 0 8px var(--ar-teal)"}} />
            Mainnet is live — sweep your wallet now
          </div>
          <h1 style={{fontSize:"clamp(32px,4.5vw,58px)",fontWeight:800,lineHeight:1.04,letterSpacing:"-0.03em",marginBottom:28}}>
            <span style={{color:"#FFFFFF",display:"block"}}>Reclaim <span style={{color:"var(--ar-yellow)"}}>Sol</span></span>
            <span style={{color:"rgba(255,255,255,0.45)",display:"block"}}>locked in your</span>
            <AnimatedWord />
          </h1>
          <p style={{fontSize:16,lineHeight:1.75,color:"rgba(255,255,255,0.4)",maxWidth:420,marginBottom:40}}>
            Every token interaction leaves an empty account draining{" "}
            <span style={{color:"rgba(255,255,255,0.85)"}}>~0.002 SOL</span>{" "}
            in rent. Arsweep closes them instantly.
          </p>
          <div style={{display:"flex",gap:12,flexWrap:"wrap",marginBottom:56}}>
            <button style={BP} onClick={()=>navigate("/app")}
              onMouseEnter={e=>(e.currentTarget.style.opacity="0.85")}
              onMouseLeave={e=>(e.currentTarget.style.opacity="1")}
            >Launch App
              <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M2 6.5h9M7.5 3l3.5 3.5L7.5 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
            </button>
            <button style={BG} onClick={()=>navigate("/docs")}
              onMouseEnter={e=>{ (e.currentTarget as HTMLElement).style.borderColor="rgba(255,255,255,0.25)"; (e.currentTarget as HTMLElement).style.color="rgba(255,255,255,0.8)"; }}
              onMouseLeave={e=>{ (e.currentTarget as HTMLElement).style.borderColor="rgba(255,255,255,0.12)"; (e.currentTarget as HTMLElement).style.color="rgba(255,255,255,0.45)"; }}
            >Read the docs</button>
          </div>
          <div style={{display:"flex",gap:36}}>
            {[{v:"~0.002 SOL",l:"per account"},{v:"< 5 sec",l:"to sweep"},{v:"0",l:"private keys seen"}].map(({v,l})=>(
              <div key={l}>
                <div style={{fontSize:20,fontWeight:700,color:"#FFFFFF",letterSpacing:"-0.02em",marginBottom:3}}>{v}</div>
                <div style={{...M,fontSize:11,color:"rgba(255,255,255,0.3)",letterSpacing:"0.04em"}}>{l}</div>
              </div>
            ))}
          </div>
        </div>
        <div style={{position:"relative"}}>
          <div style={{position:"absolute",inset:-40,zIndex:0,background:"radial-gradient(ellipse at center, rgba(255,255,255,0.03) 0%, transparent 70%)",pointerEvents:"none"}} />
          <div style={{position:"relative",zIndex:1}}><HeroDemo /></div>
        </div>
      </section>

      <div style={D6} />

      {/* HOW IT WORKS */}
      <section style={{position:"relative",zIndex:2,padding:"120px 40px",textAlign:"center"}}>
        <div style={{maxWidth:1100,margin:"0 auto"}}>
          <h2 style={{fontFamily:"var(--font-display)",fontSize:"clamp(32px,5vw,52px)",fontWeight:400,letterSpacing:"-0.01em",color:"#FFFFFF",marginBottom:12,lineHeight:1.1}}>How It Works</h2>
          <p style={{fontSize:16,color:"rgba(255,255,255,0.4)",marginBottom:64,lineHeight:1.6}}>Three steps. Under three minutes.</p>
          <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:1,background:"rgba(255,255,255,0.06)",border:"1px solid rgba(255,255,255,0.06)",borderRadius:16,overflow:"hidden"}}>
            {[
              {icon:<Shield size={18} style={{color:"rgba(255,255,255,0.6)"}}/>,n:"01",t:"Connect — we only look, not touch",d:"Read-only scan first. We identify your token accounts without touching a single lamport."},
              {icon:<Eye size={18} style={{color:"rgba(255,255,255,0.6)"}}/>,n:"02",t:"We find what's been quietly draining you",d:"Every empty account, exact SOL locked, sorted by reclaim value. The number is right there."},
              {icon:<Zap size={18} style={{color:"rgba(255,255,255,0.6)"}}/>,n:"03",t:"You approve. SOL lands back. Done.",d:"One transaction. You sign it. SOL refunded directly to your wallet in seconds."},
            ].map(({icon,n,t,d})=>(
              <div key={n} style={{padding:"36px 32px",background:"rgba(11,15,20,0.95)",textAlign:"left",transition:"background 0.2s"}}
                onMouseEnter={e=>(e.currentTarget.style.background="rgba(20,26,35,0.98)")}
                onMouseLeave={e=>(e.currentTarget.style.background="rgba(11,15,20,0.95)")}
                className="ar-fade-in"
              >
                <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:24}}>
                  <div style={{width:40,height:40,borderRadius:10,background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.08)",display:"flex",alignItems:"center",justifyContent:"center"}}>{icon}</div>
                  <span style={{...M,fontSize:11,color:"rgba(255,255,255,0.2)"}}>{n}</span>
                </div>
                <h3 style={{fontSize:17,fontWeight:600,color:"#FFFFFF",marginBottom:10,lineHeight:1.4}}>{t}</h3>
                <p style={{fontSize:14,color:"rgba(255,255,255,0.45)",lineHeight:1.75}}>{d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div style={D6} />

      {/* LIVE STATS */}
      <LiveStatsSection />

      <div style={{height:1,background:"rgba(255,255,255,0.06)"}} />

      {/* WHAT IS ARSWEEP */}
      <section style={{position:"relative",zIndex:2,padding:"120px 40px",textAlign:"center"}}>
        <div style={{maxWidth:1100,margin:"0 auto"}}>
          <h2 style={{fontFamily:"var(--font-display)",fontSize:"clamp(32px,5vw,52px)",fontWeight:400,letterSpacing:"-0.01em",color:"#FFFFFF",marginBottom:12,lineHeight:1.1}}>What is <span style={{color:"var(--ar-yellow)"}}>Arsweep</span></h2>
          <p style={{fontSize:16,color:"rgba(255,255,255,0.4)",maxWidth:600,margin:"0 auto 64px",lineHeight:1.75}}>
            Every time you interact with a token on Solana, an empty account is left behind. Each one locks ~0.002 SOL in rent indefinitely. Arsweep finds them all and closes them — returning your SOL instantly, non-custodially, on-chain.
          </p>
          <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:1,background:"rgba(255,255,255,0.06)",border:"1px solid rgba(255,255,255,0.06)",borderRadius:16,overflow:"hidden",textAlign:"left"}}>
            {[
              {icon:"◈",t:"Dust Account Scanner",d:"Automatically detects all empty token accounts in your wallet — regardless of how many tokens you have interacted with."},
              {icon:"⬡",t:"SOL Rent Reclaimer",d:"Closes selected accounts and refunds the locked rent deposit directly to your wallet. No middleman, no custody."},
              {icon:"⟳",t:"Batch Processing",d:"Close up to 27 accounts in a single transaction. Efficient, fast, and minimizes the number of approvals needed."},
              {icon:"◎",t:"Non-Custodial",d:"We never hold your assets or request your private key. Every transaction is signed by you, in your wallet."},
              {icon:"◈",t:"Fully On-Chain",d:"Every sweep operation is a verifiable Solana transaction. Transparent, permanent, and auditable by anyone."},
              {icon:"⟳",t:"Referral & Rewards",d:"Earn $ARSWP tokens by sweeping and referring others. Climb the leaderboard and get rewarded for keeping Solana clean."},
            ].map(({icon,t,d})=>(
              <div key={t} style={{padding:"36px 32px",background:"rgba(11,15,20,0.95)",transition:"background 0.2s"}}
                onMouseEnter={e=>(e.currentTarget.style.background="rgba(20,26,35,0.98)")}
                onMouseLeave={e=>(e.currentTarget.style.background="rgba(11,15,20,0.95)")}
                className="ar-fade-in"
              >
                <div style={{width:40,height:40,borderRadius:10,background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.08)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,color:"rgba(255,255,255,0.5)",marginBottom:20}}>{icon}</div>
                <h3 style={{fontSize:16,fontWeight:600,color:"#FFFFFF",marginBottom:10,lineHeight:1.4}}>{t}</h3>
                <p style={{fontSize:14,color:"rgba(255,255,255,0.45)",lineHeight:1.75}}>{d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div style={{height:1,background:"rgba(255,255,255,0.06)"}} />

      {/* SOL CALCULATOR */}
      <section style={{position:"relative",zIndex:2,padding:"120px 40px",background:"rgba(255,255,255,0.015)"}}>
        <div style={{maxWidth:1100,margin:"0 auto"}}>
          <div style={{textAlign:"center",marginBottom:64}}>
            <h2 style={{fontFamily:"var(--font-display)",fontSize:"clamp(28px,4vw,48px)",fontWeight:400,letterSpacing:"-0.01em",color:"#FFFFFF",marginBottom:12,lineHeight:1.1}}>SOL Calculator</h2>
            <p style={{fontSize:16,color:"rgba(255,255,255,0.4)",lineHeight:1.6}}>How much are you leaving behind?</p>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:48}}>
            <div>
              <div style={{display:"flex",flexDirection:"column",gap:20}}>
                {[
                  {label:"Token accounts",sRef:tSRef,nRef:tNRef,f:"t",max:MAX_T,def:0,presets:[["25%","25",null],["50%","50",null],["MAX","100",null]]},
                  {label:"SOL price (USD)",sRef:pSRef,nRef:pNRef,f:"p",max:MAX_P,def:130,presets:[["$80",null,"80"],["$130",null,"130"],["$500",null,"500"]]},
                ].map(({label,sRef,nRef,f,max,def,presets})=>(
                  <div key={f}>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
                      <span style={{fontFamily:"var(--font-mono)",fontSize:12,color:"rgba(255,255,255,0.4)"}}>{label}</span>
                      <div style={{display:"flex",gap:6}}>
                        {presets.map(([lbl,pc,pv])=>(
                          <button key={String(lbl)} className="ar5-preset"
                            data-f={f} {...(pc?{"data-pc":pc}:{})} {...(pv?{"data-pv":pv}:{})}
                            style={{fontFamily:"var(--font-mono)",fontSize:11,color:"rgba(255,255,255,0.35)",background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.08)",borderRadius:5,padding:"4px 10px",cursor:"pointer"}}
                            onMouseEnter={e=>(e.currentTarget.style.color="#FFFFFF")}
                            onMouseLeave={e=>{ if(!e.currentTarget.classList.contains("ar5-on")) e.currentTarget.style.color="rgba(255,255,255,0.35)"; }}
                          >{lbl}</button>
                        ))}
                      </div>
                    </div>
                    <div style={{display:"flex",alignItems:"center",gap:12}}>
                      <input ref={sRef} type="range" min={0} max={max} defaultValue={def} step={1}
                        style={{flex:1,height:2,appearance:"none",WebkitAppearance:"none",background:"rgba(255,255,255,0.12)",borderRadius:2,cursor:"pointer",outline:"none",border:"none",accentColor:"#FFFFFF"}} />
                      <input ref={nRef} type="number" min={0} max={max} defaultValue={def} style={INP} />
                    </div>
                  </div>
                ))}
              </div>
              <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:1,marginTop:28,background:"rgba(255,255,255,0.06)",borderRadius:10,overflow:"hidden"}}>
                {[{ref:bdARef,l:"accounts"},{ref:bdSRef,l:"SOL locked"},{ref:bdURef,l:"USD value"}].map(({ref,l})=>(
                  <div key={l} style={{textAlign:"center",padding:"14px 10px",background:"rgba(11,15,20,0.6)"}}>
                    <span ref={ref} style={{fontSize:18,fontWeight:700,color:"#FFFFFF",display:"block",marginBottom:3}}>0</span>
                    <span style={{fontFamily:"var(--font-mono)",fontSize:10,color:"rgba(255,255,255,0.3)",textTransform:"uppercase",letterSpacing:"0.08em"}}>{l}</span>
                  </div>
                ))}
              </div>
            </div>
            <div style={{background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.07)",borderRadius:16,padding:36,display:"flex",flexDirection:"column",justifyContent:"center"}}>
              <div style={{fontFamily:"var(--font-mono)",fontSize:11,color:"rgba(255,255,255,0.3)",letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:12}}>Estimated recoverable</div>
              <span ref={solRef} style={{fontSize:64,fontWeight:800,color:"#FFFFFF",lineHeight:1,letterSpacing:"-0.03em",display:"block",marginBottom:6,transition:"color 0.3s"}}>0.0000</span>
              <span ref={usdRef} style={{fontFamily:"var(--font-mono)",fontSize:13,color:"rgba(255,255,255,0.35)"}}>approx. $0.00 USD</span>
              <div style={{marginTop:24,height:2,background:"rgba(255,255,255,0.08)",borderRadius:2,overflow:"visible"}}>
                <div ref={barRef} style={{height:"100%",borderRadius:2,background:"rgba(255,255,255,0.7)",width:"0%",transition:"width 0.3s ease",position:"relative"}}>
                  <span style={{position:"absolute",right:-4,top:-3,width:8,height:8,background:"#FFFFFF",borderRadius:"50%",boxShadow:"0 0 8px rgba(255,255,255,0.4)",display:"block"}} />
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
      <section style={{position:"relative",zIndex:2,padding:"120px 40px",textAlign:"center"}}>
        <div style={{maxWidth:1100,margin:"0 auto"}}>
          <h2 style={{fontFamily:"var(--font-display)",fontSize:"clamp(28px,4vw,48px)",fontWeight:400,letterSpacing:"-0.01em",color:"#FFFFFF",marginBottom:12,lineHeight:1.1}}>Security</h2>
          <p style={{fontSize:16,color:"rgba(255,255,255,0.4)",maxWidth:480,margin:"0 auto 64px",lineHeight:1.75}}>Your keys never leave your wallet.</p>
          <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:1,background:"rgba(255,255,255,0.06)",border:"1px solid rgba(255,255,255,0.06)",borderRadius:16,overflow:"hidden"}}>
            {[
              {icon:<Shield size={18} style={{color:"rgba(255,255,255,0.6)"}}/>,t:"Non-custodial",d:"We never store or access your private keys. Ever."},
              {icon:<Eye size={18} style={{color:"rgba(255,255,255,0.6)"}}/>,t:"Open source",d:"Full codebase is public. Read every line before you use it."},
              {icon:<CheckCircle2 size={18} style={{color:"rgba(255,255,255,0.6)"}}/>,t:"On-chain verifiable",d:"Every sweep transaction is permanent and publicly verifiable."},
            ].map(({icon,t,d})=>(
              <div key={t} style={{padding:"36px 32px",background:"rgba(11,15,20,0.95)",textAlign:"left",transition:"background 0.2s"}}
                onMouseEnter={e=>(e.currentTarget.style.background="rgba(20,26,35,0.98)")}
                onMouseLeave={e=>(e.currentTarget.style.background="rgba(11,15,20,0.95)")}
                className="ar-fade-in"
              >
                <div style={{width:40,height:40,borderRadius:10,background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.08)",display:"flex",alignItems:"center",justifyContent:"center",marginBottom:20}}>{icon}</div>
                <h3 style={{fontSize:17,fontWeight:600,color:"#FFFFFF",marginBottom:10,lineHeight:1.4}}>{t}</h3>
                <p style={{fontSize:14,color:"rgba(255,255,255,0.45)",lineHeight:1.75}}>{d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div style={{height:1,background:"rgba(255,255,255,0.06)"}} />

      {/* ROADMAP */}
      <section style={{position:"relative",zIndex:2,padding:"120px 40px"}}>
        <div style={{maxWidth:1100,margin:"0 auto"}}>
          <div style={{textAlign:"center",marginBottom:72}}>
            <h2 style={{fontFamily:"var(--font-display)",fontSize:"clamp(32px,5vw,52px)",fontWeight:400,letterSpacing:"-0.01em",color:"#FFFFFF",marginBottom:12,lineHeight:1.1}}>Road<span style={{color:"var(--ar-yellow)"}}>map</span></h2>
            <p style={{fontSize:16,color:"rgba(255,255,255,0.4)",lineHeight:1.6}}>From dust sweeper to complete Solana wallet management suite.</p>
          </div>
          <div style={{background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.07)",borderRadius:12,padding:"20px 28px",marginBottom:48}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
              <span style={{fontSize:14,color:"#FFFFFF",fontWeight:500}}>Overall Progress</span>
              <span style={{fontFamily:"var(--font-mono)",fontSize:13,color:"var(--ar-teal)"}}>2 / 10 Milestones</span>
            </div>
            <div style={{height:3,background:"rgba(255,255,255,0.08)",borderRadius:2,overflow:"hidden"}}>
              <div style={{width:"20%",height:"100%",background:"var(--ar-teal)",borderRadius:2}} />
            </div>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:16}}>
            {[
              {s:"COMPLETED",sc:"var(--ar-teal)",sb:"rgba(29,184,142,0.1)",bc:"rgba(29,184,142,0.25)",t:"Devnet Testing",d:"Program deployed and tested end-to-end. Jupiter API integrated. 100+ test sweeps completed."},
              {s:"LIVE NOW",sc:"var(--ar-teal)",sb:"rgba(29,184,142,0.1)",bc:"rgba(29,184,142,0.25)",t:"Mainnet Launch",d:"Full mainnet deployment complete. Real SOL sweeping live. Treasury accumulating fees."},
              {s:"IN PROGRESS",sc:"rgba(255,255,255,0.6)",sb:"rgba(255,255,255,0.05)",bc:"rgba(255,255,255,0.15)",t:"Community Building",d:"Growing Discord and X community. Building awareness before token launch. Target: 500+ members."},
              {s:"COMING SOON",sc:"rgba(255,255,255,0.4)",sb:"rgba(255,255,255,0.03)",bc:"rgba(255,255,255,0.08)",t:"$ARSWP Token Launch",d:"Launching $ARSWP token on Pump.fun. Community members get early access and rewards."},
              {s:"Q2 2026",sc:"rgba(255,255,255,0.3)",sb:"transparent",bc:"rgba(255,255,255,0.07)",t:"AI Wallet Hygiene Agent",d:"AI-powered agent that analyzes your wallet, detects dust and spam tokens automatically."},
              {s:"Q3 2026",sc:"rgba(255,255,255,0.3)",sb:"transparent",bc:"rgba(255,255,255,0.07)",t:"Cross-Chain Swap",d:"Seamlessly swap tokens across multiple chains directly from Arsweep."},
              {s:"Q3 2026",sc:"rgba(255,255,255,0.3)",sb:"transparent",bc:"rgba(255,255,255,0.07)",t:"Vault & Earn",d:"Put your reclaimed SOL to work. Deposit into vaults and earn yield automatically."},
              {s:"Q4 2026",sc:"rgba(255,255,255,0.25)",sb:"transparent",bc:"rgba(255,255,255,0.06)",t:"Staking & Rewards",d:"Stake SOL directly from Arsweep. Earn staking rewards while keeping full control."},
              {s:"FUTURE",sc:"rgba(255,255,255,0.2)",sb:"transparent",bc:"rgba(255,255,255,0.05)",t:"Multi-Chain Expansion",d:"Expanding beyond Solana. Dust sweeping and earn features across all major chains."},
            ].map(({s,sc,sb,bc,t,d})=>(
              <div key={t} style={{background:"rgba(255,255,255,0.02)",border:`1px solid ${bc}`,borderRadius:14,padding:"28px 24px",transition:"background 0.2s"}}
                onMouseEnter={e=>(e.currentTarget.style.background="rgba(255,255,255,0.04)")}
                onMouseLeave={e=>(e.currentTarget.style.background="rgba(255,255,255,0.02)")}
                className="ar-fade-in"
              >
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
      <section style={{position:"relative",zIndex:2,padding:"120px 40px",textAlign:"center",background:"rgba(255,255,255,0.015)"}}>
        <div style={{maxWidth:640,margin:"0 auto"}}>
          <h2 style={{fontFamily:"var(--font-display)",fontSize:"clamp(32px,5vw,60px)",fontWeight:400,letterSpacing:"-0.02em",color:"#FFFFFF",marginBottom:20,lineHeight:1.05}}>
            Your SOL is already{" "}
            <span style={{color:"var(--ar-yellow)"}}>yours.</span>
          </h2>
          <p style={{fontSize:17,color:"rgba(255,255,255,0.4)",lineHeight:1.7,marginBottom:44}}>
            No email. No signup. Connect wallet, scan, done. Your SOL back in under 3 minutes.
          </p>
          <div style={{display:"flex",gap:12,justifyContent:"center",flexWrap:"wrap"}}>
            <button onClick={()=>navigate("/app")} style={BP}
              onMouseEnter={e=>(e.currentTarget.style.opacity="0.85")}
              onMouseLeave={e=>(e.currentTarget.style.opacity="1")}
            >
              Scan my wallet
              <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M2 6.5h9M7.5 3l3.5 3.5L7.5 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
            </button>
            <button onClick={()=>window.open("https://t.me/+657UAJGoNE02NDM1","_blank")} style={BG}
              onMouseEnter={e=>{ (e.currentTarget as HTMLElement).style.borderColor="rgba(255,255,255,0.25)"; (e.currentTarget as HTMLElement).style.color="rgba(255,255,255,0.8)"; }}
              onMouseLeave={e=>{ (e.currentTarget as HTMLElement).style.borderColor="rgba(255,255,255,0.12)"; (e.currentTarget as HTMLElement).style.color="rgba(255,255,255,0.45)"; }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.447 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.12L7.17 13.857l-2.96-.924c-.643-.204-.657-.643.136-.953l11.57-4.461c.537-.194 1.006.131.978.702z"/></svg>
              Join Telegram
            </button>
          </div>
        </div>
      </section>

      <div style={{height:1,background:"rgba(255,255,255,0.06)"}} />

      {/* FOOTER */}
      <footer style={{position:"relative",zIndex:2,padding:"28px 40px",display:"flex",alignItems:"center",justifyContent:"space-between",maxWidth:1200,margin:"0 auto"}}>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <ArsweepLogo className="w-6 h-6" />
          <span style={{fontFamily:"var(--font-mono)",fontSize:12,color:"rgba(255,255,255,0.25)"}}>
            Arsweep — built for Solana. 2026
          </span>
        </div>
        <div style={{display:"flex",gap:24}}>
          {[["Docs","/docs"],["GitHub","https://github.com/CodingRangga22"],["Discord","https://discord.gg/D2rtvK3fBs"],["$ARSWP","/token"]].map(([l,p])=>(
            <span key={l}
              onClick={()=>p.startsWith("http")?window.open(p,"_blank"):navigate(p)}
              style={{fontFamily:"var(--font-mono)",fontSize:12,color:"rgba(255,255,255,0.25)",cursor:"pointer",transition:"color 0.2s"}}
              onMouseEnter={e=>(e.currentTarget.style.color="rgba(255,255,255,0.7)")}
              onMouseLeave={e=>(e.currentTarget.style.color="rgba(255,255,255,0.25)")}
            >{l}</span>
          ))}
        </div>
      </footer>

      <ChatWidget />
    </div>
  );
};

export default Landing;
