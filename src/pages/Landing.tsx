import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { Shield, Github, Users, Wallet, Search, CheckCircle2, ArrowRight, ChevronRight, BookOpen, FlaskConical } from "lucide-react";
import ArsweepLogo from "@/components/ArsweepLogo";
import ChatWidget from "@/components/ChatWidget";
import PremiumFooter from "@/components/PremiumFooter";
import { useBanner } from "@/components/BannerProvider";
import SecurityTransparencySection from "@/components/landing/SecurityTransparencySection";
import ProblemEducationSection from "@/components/landing/ProblemEducationSection";
import ComparisonTable from "@/components/landing/ComparisonTable";
import LiveMetricsStrip from "@/components/landing/LiveMetricsStrip";
import RoadmapSection from "@/components/landing/RoadmapSection";
import FAQSection from "@/components/landing/FAQSection";
import { isDevnet } from "@/config/env";
import FeedbackSection from "@/components/landing/FeedbackSection";
import HeroDemo from "@/components/HeroDemo";



// Scroll-triggered section wrapper with fade in/out
const ScrollSection = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <motion.div
    initial={{ opacity: 0, y: 40, scale: 0.95 }}
    whileInView={{ opacity: 1, y: 0, scale: 1 }}
    viewport={{ once: false, amount: 0.15 }}
    transition={{ duration: 0.7, ease: "easeOut" }}
    className={className}
  >
    {children}
  </motion.div>
);

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.15, duration: 0.6, ease: "easeOut" as const },
  }),
};

const steps = [
  {
    icon: Wallet,
    title: "Connect Wallet",
    description: "Connect for a read-only scan first. We identify your token accounts without moving any funds.",
  },
  {
    icon: Search,
    title: "Identify Empty Accounts & Rent Value",
    description: "See which accounts are empty and exactly how much SOL you can reclaim from each.",
  },
  {
    icon: CheckCircle2,
    title: "Close Accounts & Reclaim SOL",
    description: "Approve the transaction to close selected accounts. Rent is refunded directly to your wallet.",
  },
];

const trustItems = [
  { icon: Github, title: "Open Source", description: "Fully transparent and community-audited codebase." },
  { icon: Shield, title: "Secure", description: "No private keys needed. Read-only wallet scanning." },
  { icon: Users, title: "Built for Solana", description: "Designed by and for the Solana community." },
];

// Animated dust particles that turn into SOL
const DustAnimation = () => (
  <div className="relative w-full max-w-md mx-auto h-64 sm:h-80">
    {/* Broom */}
    <motion.div
      initial={{ x: -60, rotate: -15 }}
      animate={{ x: [-60, 20, -60], rotate: [-15, 5, -15] }}
      transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
      className="absolute left-1/4 top-1/3 z-10"
    >
      <ArsweepLogo className="w-20 h-20 sm:w-24 sm:h-24 drop-shadow-[0_0_20px_hsla(162,93%,51%,0.4)]" />
    </motion.div>

    {/* Dust particles becoming SOL coins */}
    {Array.from({ length: 8 }).map((_, i) => (
      <motion.div
        key={i}
        className="absolute rounded-full"
        style={{
          width: 6 + Math.random() * 8,
          height: 6 + Math.random() * 8,
          left: `${40 + Math.random() * 40}%`,
          top: `${30 + Math.random() * 40}%`,
        }}
        initial={{ opacity: 0.3, scale: 1 }}
        animate={{
          opacity: [0.3, 0.8, 0],
          scale: [1, 1.5, 0.5],
          x: [0, 40 + i * 10, 80 + i * 15],
          y: [0, -20 - i * 5, -40 - i * 10],
          backgroundColor: ["hsl(0 0% 40%)", "hsl(162 93% 51%)", "hsl(45 100% 60%)"],
        }}
        transition={{
          duration: 2.5,
          repeat: Infinity,
          delay: i * 0.3,
          ease: "easeOut",
        }}
      />
    ))}

    {/* Glowing SOL coins collecting */}
    {[0, 1, 2].map((i) => (
      <motion.div
        key={`coin-${i}`}
        className="absolute w-5 h-5 rounded-full border border-primary/50"
        style={{
          right: `${10 + i * 12}%`,
          bottom: `${20 + i * 8}%`,
          background: "var(--gradient-primary)",
        }}
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: [0, 1, 0.7], scale: [0, 1.2, 1] }}
        transition={{ duration: 2, repeat: Infinity, delay: 1 + i * 0.4 }}
      />
    ))}

    {/* Ambient glow */}
    <div className="orb w-48 h-48 bg-primary/15 top-1/4 left-1/4" />
    <div className="orb w-36 h-36 bg-secondary/15 bottom-0 right-1/4" />
  </div>
);

const Landing = () => {
  const navigate = useNavigate();
  const { bannerHeight } = useBanner();

  const handleLaunch = () => {
    navigate("/app");
  };

  return (
    <div className="relative min-h-screen bg-background overflow-hidden">
      {/* Ambient orbs */}
      <div className="orb w-[600px] h-[600px] bg-primary/8 top-0 -right-60 animate-pulse-glow" />
      <div className="orb w-[500px] h-[500px] bg-secondary/8 bottom-1/4 -left-40 animate-pulse-glow" style={{ animationDelay: "2s" }} />

      {/* Header */}
      <header
        className="fixed left-0 right-0 z-50 glass border-b border-border transition-[top] duration-200"
        style={{ top: bannerHeight }}
      >
        <div className="container mx-auto px-4 h-16 flex items-center justify-between relative">
          {/* Center - Watch Demo */}
          <div className="absolute left-1/2 -translate-x-1/2">
            <Link
              to="/demo"
              className="group flex items-center gap-2 px-5 py-2 rounded-full text-sm font-semibold bg-gradient-to-r from-emerald-500/10 to-cyan-500/10 border border-emerald-400/40 text-emerald-300 hover:from-emerald-500/20 hover:to-cyan-500/20 hover:border-emerald-400/70 hover:text-emerald-200 hover:shadow-[0_0_20px_rgba(52,211,153,0.2)] transition-all duration-300"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
              </span>
              <span className="hidden sm:inline">▶ Watch Demo</span><span className="sm:hidden">▶ Demo</span>
            </Link>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/" className="flex items-center gap-3 hover:opacity-90 transition-opacity">
              <ArsweepLogo className="w-8 h-8" />
              <span className="text-xl font-bold gradient-text"><span translate="no" className="notranslate">Arsweep</span></span>
            </Link>
          </div>
          <div className="flex items-center gap-3">
            <Link
              to="/docs"
              className="hidden sm:flex glass glass-hover items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
            >
              <BookOpen className="w-4 h-4" />
              Docs
            </Link>
            <motion.button
              whileHover={{
                scale: 1.03,
                boxShadow: "0 0 20px hsla(162, 93%, 51%, 0.3), 0 0 40px hsla(271, 100%, 63%, 0.15)",
              }}
              whileTap={{ scale: 0.97 }}
              onClick={handleLaunch}
              className="gradient-bg gradient-bg-hover px-5 py-2 rounded-xl text-primary-foreground text-sm font-semibold transition-all duration-200 flex items-center gap-2"
            >
              <span className="hidden sm:inline">Launch App</span>
              <span className="sm:hidden">Launch</span>
              <ArrowRight className="w-4 h-4" />
            </motion.button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative pt-32 pb-20 px-4 overflow-hidden">
        <div className="container mx-auto max-w-6xl">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial="hidden"
              animate="visible"
              className="text-center lg:text-left"
            >
              <motion.div
                custom={0}
                variants={fadeUp}
                className="flex flex-wrap items-center gap-2 mb-6"
              >
                <span className="inline-flex items-center gap-2 glass px-4 py-1.5 rounded-full text-sm text-muted-foreground">
                  Solana Wallet Cleaner
                </span>
                {isDevnet && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border border-amber-500/30 bg-amber-500/10 text-amber-400">
                    Currently in Devnet Testing Phase
                  </span>
                )}
              </motion.div>

              <motion.h1
                custom={1}
                variants={fadeUp}
                className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight mb-5 text-foreground"
              >
                Reclaim Locked SOL from{" "}
                <span className="gradient-text">Empty Token Accounts</span>
              </motion.h1>

              <motion.p
                custom={2}
                variants={fadeUp}
                className="text-lg text-muted-foreground max-w-lg mx-auto lg:mx-0 mb-8 leading-relaxed"
              >
                Close unused Solana token accounts and instantly recover rent deposits — fully non-custodial and on-chain.
              </motion.p>

              <motion.div custom={3} variants={fadeUp} className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start w-full sm:w-auto">
                <motion.button
                  whileHover={{
                    scale: 1.03,
                    boxShadow: "0 0 24px hsla(162, 93%, 51%, 0.35), 0 0 48px hsla(271, 100%, 63%, 0.2)",
                  }}
                  whileTap={{ scale: 0.97 }}
                  onClick={handleLaunch}
                  className="gradient-bg gradient-bg-hover px-8 py-3.5 rounded-2xl text-primary-foreground font-semibold text-base transition-all duration-200 shadow-lg flex items-center justify-center gap-2"
                >
                  Start Reclaiming
                  <ChevronRight className="w-5 h-5" />
                </motion.button>
                <motion.a
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  href="#how-it-works"
                  className="glass glass-hover px-8 py-3.5 rounded-2xl text-foreground font-semibold text-base transition-all duration-200 text-center"
                >
                  How It Works
                </motion.a>
                <motion.a
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  href="/simulation"
                  className="glass glass-hover px-8 py-3.5 rounded-2xl text-foreground font-semibold text-base transition-all duration-200 text-center flex items-center justify-center gap-2 border border-yellow-400/30 text-yellow-400 hover:text-yellow-300"
                >
                  <FlaskConical className="w-5 h-5" />
                  Try Simulation
                </motion.a>
              </motion.div>

              <motion.div custom={4} variants={fadeUp} className="mt-8 space-y-4">
                <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground">
                  <span className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                    Non-custodial
                  </span>
                  <span className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                    No private key access
                  </span>
                  <span className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                    Fully on-chain & verifiable
                  </span>
                  <span className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                    Open source
                  </span>
                </div>
                <div className="flex flex-wrap gap-x-8 gap-y-3 text-sm mt-2">
                  <span className="flex items-center gap-2"><span className="text-primary font-bold text-xl">~0.002</span><span className="text-muted-foreground ml-1">SOL per account</span></span>
                  <span className="flex items-center gap-2"><span className="text-primary font-bold text-xl">1.5%</span><span className="text-muted-foreground ml-1">platform fee</span></span>
                  <span className="flex items-center gap-2"><span className="text-primary font-bold text-xl">&lt;5s</span><span className="text-muted-foreground ml-1">sweep time</span></span>
                </div>
                <p className="text-sm text-muted-foreground">
                  💰 Over <span className="text-primary font-semibold">0.00204 SOL</span> recovered per account
                </p>
              </motion.div>
            </motion.div>

            <div className="hidden lg:block lg:pl-16 xl:pl-24">
              <HeroDemo />
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <ScrollSection>
        <section id="how-it-works" className="py-24 px-4 relative">
          <div className="container mx-auto max-w-5xl">
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl font-extrabold mb-4 text-foreground">
                How <span className="gradient-text"><span translate="no" className="notranslate">Arsweep</span></span>{" "}Works
              </h2>
              <p className="text-muted-foreground text-lg max-w-md mx-auto mb-2">
                Three simple steps to reclaim your SOL.
              </p>
              <p className="text-xs text-muted-foreground italic">
                No transactions occur until you approve.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {steps.map((step, i) => (
                <motion.div
                  key={step.title}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: false, amount: 0.3 }}
                  transition={{ delay: i * 0.15, duration: 0.5 }}
                  className="glass rounded-2xl p-8 text-center relative group hover:glow-primary transition-shadow duration-300"
                >
                  <div className="w-14 h-14 rounded-2xl gradient-bg flex items-center justify-center mx-auto mb-5">
                    <step.icon className="w-7 h-7 text-primary-foreground" />
                  </div>
                  <div className="text-xs font-bold text-primary mb-2">STEP {i + 1}</div>
                  <h3 className="text-xl font-bold mb-3 text-foreground">{step.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{step.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      </ScrollSection>

      <ScrollSection>
        <ProblemEducationSection />
      </ScrollSection>

      <ScrollSection>
        <SecurityTransparencySection />
      </ScrollSection>

      <ScrollSection>
        <section className="py-24 px-4 relative">
          <div className="container mx-auto max-w-5xl">
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl font-extrabold mb-4 text-foreground">
                Why <span className="gradient-text"><span translate="no" className="notranslate">Arsweep</span></span>?
              </h2>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {trustItems.map((item, i) => (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: false, amount: 0.3 }}
                  transition={{ delay: i * 0.15, duration: 0.5 }}
                  className="glass rounded-2xl p-8 text-center"
                >
                  <item.icon className="w-10 h-10 text-primary mx-auto mb-4" />
                  <h3 className="text-lg font-bold mb-2 text-foreground">{item.title}</h3>
                  <p className="text-muted-foreground text-sm">{item.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      </ScrollSection>

      <ScrollSection>
        <ComparisonTable />
      </ScrollSection>

      <ScrollSection>
        <LiveMetricsStrip />
      </ScrollSection>

      <ScrollSection>
        <RoadmapSection />
      </ScrollSection>

      <ScrollSection>
      <section className="py-24 px-4 relative">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="container mx-auto max-w-3xl text-center glass rounded-3xl p-14 relative overflow-hidden border border-primary/20"
        >
          <div className="orb w-64 h-64 bg-primary/15 -top-32 -left-32" />
          <div className="orb w-48 h-48 bg-secondary/15 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
          <div className="orb w-32 h-32 bg-secondary/20 -bottom-16 -right-16" />
          <h2 className="text-4xl sm:text-5xl font-extrabold mb-5 text-foreground relative z-10">
            Reclaim Your <span className="gradient-text">Locked SOL</span> Now
          </h2>
          <p className="text-muted-foreground mb-8 relative z-10">
            Every empty token account costs you ~0.002 SOL. Sweep them all in one click — free, non-custodial, instant.
          </p>
          <div className="flex flex-wrap justify-center gap-4 mb-8 relative z-10 text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5">✅ Non-custodial</span>
              <span className="flex items-center gap-1.5">⚡ Takes 5 seconds</span>
              <span className="flex items-center gap-1.5">🔒 Keys never leave your wallet</span>
              <span className="flex items-center gap-1.5">📖 Open source</span>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 justify-center relative z-10">
            <motion.button
              whileHover={{
                scale: 1.03,
                boxShadow: "0 0 28px hsla(162, 93%, 51%, 0.35), 0 0 56px hsla(271, 100%, 63%, 0.2)",
              }}
              whileTap={{ scale: 0.97 }}
              onClick={handleLaunch}
              className="gradient-bg gradient-bg-hover px-10 py-4 rounded-2xl text-primary-foreground font-semibold text-lg transition-all duration-200 shadow-lg flex items-center justify-center gap-2"
            >
              Sweep My Wallet →
              <ArrowRight className="w-5 h-5" />
            </motion.button>
            <motion.a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="glass glass-hover px-10 py-4 rounded-2xl text-foreground font-semibold text-lg transition-all duration-200 flex items-center justify-center gap-2 border border-border"
            >
              View GitHub
              <Github className="w-5 h-5" />
            </motion.a>
          </div>
        </motion.div>
      </section>
      </ScrollSection>

      <ScrollSection>
        <FAQSection />
      </ScrollSection>

      <ScrollSection>
        <FeedbackSection />
      </ScrollSection>

      {/* Footer */}
      <ScrollSection>
        <PremiumFooter />
      </ScrollSection>

      {/* Chat Widget */}
      <ChatWidget />
    </div>
  );
};

export default Landing;
