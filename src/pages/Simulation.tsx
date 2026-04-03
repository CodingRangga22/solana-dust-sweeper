import { useState } from "react";
import { motion } from "framer-motion";
import { FlaskConical, Zap, RefreshCw, ArrowRight, CheckCircle2 } from "lucide-react";
import { Link } from "react-router-dom";
import Header from "@/components/Header";
import PremiumFooter from "@/components/PremiumFooter";

const formatAddress = (addr: string) => addr.slice(0, 4) + "..." + addr.slice(-4);
const formatSOL = (lamports: number) => (lamports / 1e9).toFixed(6);
type SimStep = "idle" | "scanning" | "scanned" | "sweeping" | "done";
interface DummyToken { pubkey: string; symbol: string; balance: number; rentExempt: number; }
const SAMPLE_WALLETS = ["7vfC...oxs", "CuieV...SkM", "5Q544...4j1"];
const generateDummyTokens = (): DummyToken[] => [
  { pubkey: "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJe8bXh", symbol: "USDC", balance: 0, rentExempt: 2039280 },
  { pubkey: "BTokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJe8bXh", symbol: "BONK", balance: 0.000001, rentExempt: 2039280 },
  { pubkey: "CTokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJe8bXh", symbol: "WIF", balance: 0, rentExempt: 2039280 },
  { pubkey: "DTokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJe8bXh", symbol: "JUP", balance: 0, rentExempt: 2039280 },
  { pubkey: "ETokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJe8bXh", symbol: "PYTH", balance: 0.000002, rentExempt: 2039280 },
  { pubkey: "FTokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJe8bXh", symbol: "ORCA", balance: 0, rentExempt: 2039280 },
  { pubkey: "GTokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJe8bXh", symbol: "RAY", balance: 0, rentExempt: 2039280 },
  { pubkey: "HTokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJe8bXh", symbol: "SAMO", balance: 0, rentExempt: 2039280 },
  { pubkey: "ITokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJe8bXh", symbol: "MNGO", balance: 0, rentExempt: 2039280 },
  { pubkey: "JTokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJe8bXh", symbol: "DUST", balance: 0, rentExempt: 2039280 },
];

const Simulation = () => {
  const [step, setStep] = useState<SimStep>("idle");
  const [tokens, setTokens] = useState<DummyToken[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [currentWallet, setCurrentWallet] = useState<string>("");
  const [progress, setProgress] = useState(0);
  const totalRent = tokens.filter(t => selected.has(t.pubkey)).reduce((acc, t) => acc + t.rentExempt, 0);
  const netRefund = totalRent * 0.985; // 1.5% platform fee

  const handleScan = async () => {
    setStep("scanning");
    setTokens([]);
    setSelected(new Set());
    const wallet = SAMPLE_WALLETS[Math.floor(Math.random() * SAMPLE_WALLETS.length)];
    setCurrentWallet(wallet);
    await new Promise(r => setTimeout(r, 2000));
    const dummy = generateDummyTokens();
    setTokens(dummy);
    setSelected(new Set(dummy.map(t => t.pubkey)));
    setStep("scanned");
  };

  const handleSimSweep = async () => {
    setStep("sweeping");
    setProgress(0);
    const count = selected.size;
    for (let i = 0; i < count; i++) {
      await new Promise(r => setTimeout(r, 250));
      setProgress(Math.round(((i + 1) / count) * 100));
    }
    await new Promise(r => setTimeout(r, 400));
    setStep("done");
  };

  const handleReset = () => { setStep("idle"); setTokens([]); setSelected(new Set()); setProgress(0); };

  return (
    <div className="relative min-h-screen bg-background overflow-hidden">
      <div className="orb w-[500px] h-[500px] bg-primary/10 top-0 -right-40 animate-float" />
      <div className="orb w-[400px] h-[400px] bg-secondary/10 bottom-20 -left-20 animate-float" style={{ animationDelay: "2s" }} />
      <Header />
      <div className="container mx-auto max-w-2xl px-4 pt-24 pb-12">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-yellow-400/10 border border-yellow-400/30 text-yellow-400 text-xs font-semibold mb-4">
            <FlaskConical className="w-3.5 h-3.5" />SIMULATION MODE
          </div>
          <h1 className="text-3xl font-extrabold mb-3">See Arsweep in Action</h1>
          <p className="text-muted-foreground text-sm max-w-md mx-auto">No wallet needed. See exactly how Arsweep finds and closes dust accounts to reclaim your SOL.</p>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass rounded-2xl border border-border/50 overflow-hidden">
          {step === "idle" && (
            <div className="p-8 text-center">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-4">
                <FlaskConical className="w-8 h-8 text-primary" />
              </div>
              <p className="text-muted-foreground text-sm mb-6">Click below to simulate a wallet scan and see how much SOL you could reclaim.</p>
              <button onClick={handleScan} className="btn-primary px-8 py-3 rounded-xl font-semibold text-sm flex items-center gap-2 mx-auto">
                <Zap className="w-4 h-4" />Start Simulation
              </button>
            </div>
          )}
          {step === "scanning" && (
            <div className="p-8 text-center">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-4">
                <RefreshCw className="w-8 h-8 text-primary animate-spin" />
              </div>
              <p className="font-semibold mb-1">Scanning wallet...</p>
              <p className="text-muted-foreground text-xs font-mono">{currentWallet}</p>
            </div>
          )}
          {step === "scanned" && (
            <div>
              <div className="px-5 py-4 border-b border-border/50 flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Sample wallet</p>
                  <p className="text-sm font-mono font-medium">{currentWallet}</p>
                </div>
                <div className="flex items-center gap-3 text-right">
                  <div><p className="text-xs text-muted-foreground">Dust found</p><p className="text-sm font-bold text-primary">{tokens.length} accounts</p></div>
                  <div><p className="text-xs text-muted-foreground">Est. refund</p><p className="text-sm font-bold text-green-400">{formatSOL(netRefund)} SOL</p></div>
                </div>
              </div>
              <div className="divide-y divide-border/30 max-h-72 overflow-y-auto">
                {tokens.map(token => (
                  <div key={token.pubkey} className="flex items-center gap-3 px-5 py-3 hover:bg-muted/10 transition-colors">
                    <input type="checkbox" checked={selected.has(token.pubkey)} onChange={e => {
                      const next = new Set(selected);
                      e.target.checked ? next.add(token.pubkey) : next.delete(token.pubkey);
                      setSelected(next);
                    }} className="rounded accent-primary" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-mono text-muted-foreground truncate">{formatAddress(token.pubkey)}</p>
                      <p className="text-xs font-medium">{token.symbol}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">bal: {token.balance}</p>
                      <p className="text-xs font-semibold">{formatSOL(token.rentExempt)} SOL</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="px-5 py-4 border-t border-border/50 flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">{selected.size} selected · Est. net refund</p>
                  <p className="text-base font-bold text-green-400">{formatSOL(netRefund)} SOL</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={handleReset} className="px-4 py-2 rounded-xl border border-border text-sm text-muted-foreground hover:text-foreground transition-colors">Reset</button>
                  <button onClick={handleSimSweep} disabled={selected.size === 0} className="btn-primary px-4 py-2 rounded-xl text-sm font-semibold disabled:opacity-50">Simulate Sweep</button>
                </div>
              </div>
            </div>
          )}
          {step === "sweeping" && (
            <div className="p-8 text-center">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-4">
                <Zap className="w-8 h-8 text-primary animate-pulse" />
              </div>
              <p className="font-semibold mb-4">Simulating sweep...</p>
              <div className="w-full bg-muted/30 rounded-full h-2 mb-2">
                <motion.div className="bg-primary h-2 rounded-full" animate={{ width: `${progress}%` }} transition={{ duration: 0.3 }} />
              </div>
              <p className="text-xs text-muted-foreground">{progress}% complete</p>
            </div>
          )}
          {step === "done" && (
            <div className="p-8 text-center">
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 200 }}
                className="w-16 h-16 rounded-2xl bg-green-500/10 border border-green-500/20 flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-8 h-8 text-green-400" />
              </motion.div>
              <h2 className="text-xl font-bold mb-1">Simulation Complete!</h2>
              <p className="text-muted-foreground text-sm mb-2">If this were real, you would have reclaimed:</p>
              <p className="text-3xl font-extrabold text-green-400 mb-2">{formatSOL(netRefund)} SOL</p>
              <p className="text-sm text-muted-foreground mb-6">from {selected.size} closed dust accounts</p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button onClick={handleReset} className="px-6 py-2.5 rounded-xl border border-border text-sm font-medium hover:bg-muted/20 transition-colors">Try Again</button>
                <Link to="/app" className="btn-primary px-6 py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2">
                  Sweep My Wallet<ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          )}
        </motion.div>
        <p className="text-center text-xs text-muted-foreground mt-4">⚠️ Simulation only — no real transactions or wallet connection required.</p>
      </div>
      <PremiumFooter />
    </div>
  );
};

export default Simulation;
