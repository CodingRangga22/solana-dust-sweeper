import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Coins, Users, Zap, Shield, Trophy, ExternalLink, Menu } from "lucide-react";
import ArsweepLogo from "@/components/ArsweepLogo";
import PremiumFooter from "@/components/PremiumFooter";
import ChatWidget from "@/components/ChatWidget";
import { useBanner } from "@/components/BannerProvider";
import { useSidebar } from "@/components/SidebarContext";

const tokenomics = [
  { label: "Liquidity Pool (Primary)", percent: 50, color: "from-emerald-400 to-cyan-400" },
  { label: "Ecosystem & Rewards", percent: 25, color: "from-cyan-400 to-blue-400" },
  { label: "Team & Dev", percent: 15, color: "from-violet-400 to-purple-400" },
  { label: "Reserve", percent: 10, color: "from-pink-400 to-rose-400" },
  
];

const utilities = [
  { icon: Trophy, title: "Leaderboard Rewards", desc: "Top sweepers earn $ARSWP every season based on accounts closed and SOL reclaimed." },
  { icon: Users, title: "Referral Bonuses", desc: "Earn $ARSWP for every friend you refer who sweeps their wallet." },
  { icon: Zap, title: "Fee Discounts", desc: "Hold $ARSWP to get reduced platform fees on every sweep." },
  { icon: Shield, title: "Governance", desc: "Vote on future features, fee structures, and protocol upgrades." },
];

const TokenPage = () => {
  const navigate = useNavigate();
  const { bannerHeight } = useBanner();
  const { setOpen } = useSidebar();

  return (
    <div className="relative min-h-screen bg-background overflow-hidden">
      <div className="orb w-[600px] h-[600px] bg-primary/8 top-0 -right-60 animate-pulse-glow" />
      <div className="orb w-[500px] h-[500px] bg-secondary/8 bottom-1/4 -left-40 animate-pulse-glow" style={{ animationDelay: "2s" }} />

      {/* Header */}
      <header className="fixed left-0 right-0 z-50 glass border-b border-border" style={{ top: bannerHeight }}>
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => setOpen(true)} className="sm:hidden p-2 rounded-xl hover:bg-muted/50 text-muted-foreground hover:text-foreground transition-colors" aria-label="Open menu"><Menu className="w-5 h-5" /></button>
            <button onClick={() => navigate("/")} className="flex items-center gap-3 hover:opacity-90 transition-opacity">
            <ArsweepLogo className="w-8 h-8" />
              <span className="text-xl font-bold gradient-text">Arsweep</span>
            </button>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => navigate("/")} className="text-sm text-muted-foreground hover:text-primary transition-colors">← Back to Home</button>
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => navigate("/app")}
              className="gradient-bg px-5 py-2 rounded-xl text-primary-foreground text-sm font-semibold flex items-center gap-2"
            >
              Launch App <ArrowRight className="w-4 h-4" />
            </motion.button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative pt-36 pb-20 px-4 text-center">
        <div className="container mx-auto max-w-4xl">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <span className="inline-flex items-center gap-2 glass px-4 py-1.5 rounded-full text-sm text-muted-foreground mb-6">
              <Coins className="w-4 h-4 text-primary" />
              Solana SPL Token
            </span>
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight mb-6">
              Introducing{" "}
              <span className="gradient-text">$ARSWP</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-4 leading-relaxed">
              The native token of the Arsweep ecosystem. Earn it by sweeping. Use it for discounts. Vote with it on governance.
            </p>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 text-sm font-semibold mb-10">
              🔜 Coming Soon — Join the waitlist on Discord
            </div>
            <div className="flex flex-wrap justify-center gap-4">
              <motion.button
                whileHover={{ scale: 1.03, boxShadow: "0 0 24px hsla(162,93%,51%,0.35)" }}
                whileTap={{ scale: 0.97 }}
                onClick={() => navigate("/app")}
                className="gradient-bg px-8 py-4 rounded-2xl text-primary-foreground font-semibold text-lg flex items-center gap-2"
              >
                Earn $ARSWP Now <ArrowRight className="w-5 h-5" />
              </motion.button>
              <motion.a
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                href="https://discord.gg/D2rtvK3fBs"
                target="_blank"
                rel="noopener noreferrer"
                className="glass glass-hover px-8 py-4 rounded-2xl text-foreground font-semibold text-lg flex items-center gap-2"
              >
                Join Discord <ExternalLink className="w-5 h-5" />
              </motion.a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Tokenomics */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-extrabold mb-3">Tokenomics</h2>
            <p className="text-muted-foreground">Total Supply: <span className="text-primary font-bold">1,000,000,000 $ARSWP</span></p>
          </div>
          <div className="glass rounded-3xl p-8 space-y-4">
            {tokenomics.map((item, i) => (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="space-y-2"
              >
                <div className="flex justify-between text-sm">
                  <span className="font-medium text-foreground">{item.label}</span>
                  <span className="text-primary font-bold">{item.percent}%</span>
                </div>
                <div className="h-3 bg-muted/30 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    whileInView={{ width: `${item.percent}%` }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8, delay: i * 0.1 }}
                    className={`h-full rounded-full bg-gradient-to-r ${item.color}`}
                  />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Utility */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-extrabold mb-3">Token Utility</h2>
            <p className="text-muted-foreground">$ARSWP is earned, not just bought.</p>
          </div>
          <div className="grid sm:grid-cols-2 gap-6">
            {utilities.map((item, i) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="glass rounded-2xl p-6 flex gap-4"
              >
                <div className="w-12 h-12 rounded-xl gradient-bg flex items-center justify-center shrink-0">
                  <item.icon className="w-6 h-6 text-primary-foreground" />
                </div>
                <div>
                  <h3 className="font-bold text-foreground mb-1">{item.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-3xl text-center glass rounded-3xl p-12 border border-primary/20 relative overflow-hidden">
          <div className="orb w-64 h-64 bg-primary/15 -top-32 -left-32" />
          <div className="orb w-48 h-48 bg-secondary/15 -bottom-16 -right-16" />
          <h2 className="text-3xl sm:text-4xl font-extrabold mb-4 relative z-10">
            Ready to earn <span className="gradient-text">$ARSWP</span>?
          </h2>
          <p className="text-muted-foreground mb-8 relative z-10">
            Start sweeping your wallet now. Every account you close earns you points toward $ARSWP rewards.
          </p>
          <motion.button
            whileHover={{ scale: 1.03, boxShadow: "0 0 28px hsla(162,93%,51%,0.35)" }}
            whileTap={{ scale: 0.97 }}
            onClick={() => navigate("/app")}
            className="gradient-bg px-10 py-4 rounded-2xl text-primary-foreground font-semibold text-lg flex items-center gap-2 mx-auto relative z-10"
          >
            Sweep & Earn <ArrowRight className="w-5 h-5" />
          </motion.button>
        </div>
      </section>

      <PremiumFooter />
      <ChatWidget />
    </div>
  );
};

export default TokenPage;
