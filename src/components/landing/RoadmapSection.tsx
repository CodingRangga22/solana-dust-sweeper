import { motion } from "framer-motion";
import { Check, Rocket, Zap, Code2, Globe, Shield, Bot, ArrowLeftRight, Landmark, TrendingUp } from "lucide-react";

const milestones = [
  {
    label: "Devnet Testing",
    status: "done",
    desc: "Completed",
    detail: "Program deployed and tested end-to-end. Jupiter API integrated. 100+ test sweeps completed.",
    icon: Check,
    color: "text-emerald-400",
    bg: "bg-emerald-400/10",
    ring: "ring-emerald-400/20",
  },
  {
    label: "Mainnet Launch",
    status: "done",
    desc: "Live Now",
    detail: "Full mainnet deployment complete. Real SOL sweeping live. Treasury accumulating fees.",
    icon: Rocket,
    color: "text-emerald-400",
    bg: "bg-emerald-400/10",
    ring: "ring-emerald-400/20",
  },
  {
    label: "Smart Contract Audit",
    status: "current",
    desc: "In Progress",
    detail: "Third-party security audit underway. Results to be published publicly for full transparency.",
    icon: Shield,
    color: "text-primary",
    bg: "bg-primary/10",
    ring: "ring-primary/30",
  },
  {
    label: "AI Wallet Hygiene Agent",
    status: "upcoming",
    desc: "Q2 2026",
    detail: "AI-powered agent that automatically analyzes your wallet, detects dust, spam tokens, and suggests optimal cleaning strategies.",
    icon: Bot,
    color: "text-purple-400",
    bg: "bg-purple-400/10",
    ring: "",
  },
  {
    label: "Cross-Chain Swap",
    status: "upcoming",
    desc: "Q3 2026",
    detail: "Seamlessly swap tokens across multiple chains directly from Arsweep. Bridge assets without leaving the app.",
    icon: ArrowLeftRight,
    color: "text-blue-400",
    bg: "bg-blue-400/10",
    ring: "",
  },
  {
    label: "Vault & Earn",
    status: "upcoming",
    desc: "Q3 2026",
    detail: "Put your reclaimed SOL to work. Deposit into vaults and earn yield on your recovered assets automatically.",
    icon: Landmark,
    color: "text-yellow-400",
    bg: "bg-yellow-400/10",
    ring: "",
  },
  {
    label: "Staking & Rewards",
    status: "upcoming",
    desc: "Q4 2026",
    detail: "Stake SOL directly from Arsweep. Earn staking rewards while keeping full control of your assets.",
    icon: TrendingUp,
    color: "text-pink-400",
    bg: "bg-pink-400/10",
    ring: "",
  },
  {
    label: "Multi-Chain Expansion",
    status: "upcoming",
    desc: "Future",
    detail: "Expanding beyond Solana. Dust sweeping, vault, and earn features across all major chains.",
    icon: Globe,
    color: "text-orange-400",
    bg: "bg-orange-400/10",
    ring: "",
  },
  {
    label: "Public API & SDK",
    status: "upcoming",
    desc: "Future",
    detail: "Developer API and SDK to integrate Arsweep features into any dApp or wallet.",
    icon: Code2,
    color: "text-cyan-400",
    bg: "bg-cyan-400/10",
    ring: "",
  },
];

const RoadmapSection = () => (
  <motion.section
    initial={{ opacity: 0, y: 40 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, amount: 0.1 }}
    transition={{ duration: 0.6, ease: "easeOut" }}
    className="py-24 px-4 relative"
  >
    <div className="container mx-auto max-w-4xl">
      <div className="text-center mb-14">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold uppercase tracking-widest mb-4">
          <Rocket className="w-3 h-3" /> Roadmap
        </div>
        <h2 className="text-3xl sm:text-4xl font-extrabold mb-4 text-foreground">
          Built to <span className="gradient-text">Last</span>
        </h2>
        <p className="text-muted-foreground max-w-md mx-auto">
          Arsweep is more than a dust sweeper. We are building the complete DeFi wallet management suite on Solana.
        </p>
      </div>

      {/* Progress bar */}
      <div className="mb-12 glass rounded-2xl p-6 border border-border/50">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-semibold text-foreground">Overall Progress</span>
          <span className="text-sm font-bold text-primary">2 / 9 Milestones</span>
        </div>
        <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-emerald-400 to-primary rounded-full" style={{ width: "22%" }} />
        </div>
        <div className="flex justify-between mt-2 text-xs text-muted-foreground">
          <span>Devnet Testing</span>
          <span>Public API</span>
        </div>
      </div>

      {/* Timeline grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {milestones.map((m, i) => {
          const Icon = m.icon;
          return (
            <motion.div
              key={m.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.07, duration: 0.5 }}
              className={`glass rounded-2xl p-5 border transition-all duration-200 relative overflow-hidden flex flex-col gap-3 ${
                m.status === "done"
                  ? "border-emerald-400/20 bg-emerald-400/5"
                  : m.status === "current"
                  ? "border-primary/30 bg-primary/5"
                  : "border-border/50 hover:border-border"
              }`}
            >
              <div className="flex items-start justify-between">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${m.bg} ${m.status !== "upcoming" ? "ring-4 " + m.ring : ""}`}>
                  <Icon className={`w-5 h-5 ${m.color}`} />
                </div>
                <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full ${
                  m.status === "done"
                    ? "bg-emerald-400/20 text-emerald-400"
                    : m.status === "current"
                    ? "bg-primary/20 text-primary"
                    : "bg-muted text-muted-foreground"
                }`}>
                  {m.desc}
                </span>
              </div>
              <div>
                <h3 className="font-bold text-foreground mb-1 text-sm">{m.label}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{m.detail}</p>
              </div>
              <div className={`absolute bottom-0 left-0 h-0.5 w-full ${
                m.status === "done" ? "bg-emerald-400" : m.status === "current" ? "bg-primary animate-pulse" : "bg-muted/30"
              }`} />
            </motion.div>
          );
        })}
      </div>

      <div className="text-center mt-10">
        <p className="text-xs text-muted-foreground">
          Last updated: March 2026 &nbsp;·&nbsp;
          <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
            View on GitHub
          </a>
        </p>
      </div>
    </div>
  </motion.section>
);

export default RoadmapSection;
