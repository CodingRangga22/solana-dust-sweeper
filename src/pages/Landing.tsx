import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { Shield, Github, Users, Wallet, Search, Sparkles, ArrowRight, ChevronRight, BookOpen } from "lucide-react";
import ArsweepLogo from "@/components/ArsweepLogo";
import ThemeToggle from "@/components/ThemeToggle";
import ChatWidget from "@/components/ChatWidget";
import PremiumFooter from "@/components/PremiumFooter";




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
    description: "Securely view your token accounts. No private keys needed — read-only access.",
  },
  {
    icon: Search,
    title: "Scan for Dust",
    description: "Our scanner identifies empty accounts, scam airdrops, and reclaimable rent deposits.",
  },
  {
    icon: Sparkles,
    title: "Sweep & Refund",
    description: "Close worthless accounts and get your SOL rent back instantly in one click.",
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
  const [totalSolReclaimed, setTotalSolReclaimed] = useState(1240.55);

  useEffect(() => {
    const interval = setInterval(() => {
      const increment = 0.002 + Math.random() * (0.04 - 0.002);
      setTotalSolReclaimed((prev) => Math.round((prev + increment) * 100) / 100);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const handleLaunch = () => {
    navigate("/app");
  };

  return (
    <div className="relative min-h-screen bg-background overflow-hidden">
      {/* Ambient orbs */}
      <div className="orb w-[600px] h-[600px] bg-primary/8 top-0 -right-60 animate-pulse-glow" />
      <div className="orb w-[500px] h-[500px] bg-secondary/8 bottom-1/4 -left-40 animate-pulse-glow" style={{ animationDelay: "2s" }} />

      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 glass border-b border-border">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/" className="flex items-center gap-3 hover:opacity-90 transition-opacity">
              <ArsweepLogo className="w-8 h-8" />
              <span className="text-xl font-bold gradient-text">Arsweep</span>
            </Link>
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Link
              to="/docs"
              className="glass glass-hover flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
            >
              <BookOpen className="w-4 h-4" />
              Docs
            </Link>
            <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={handleLaunch}
            className="gradient-bg gradient-bg-hover px-5 py-2 rounded-xl text-primary-foreground text-sm font-semibold transition-all duration-200 flex items-center gap-2"
          >
            Launch App
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
                className="inline-flex items-center gap-2 glass px-4 py-1.5 rounded-full text-sm text-muted-foreground mb-6"
              >
                <Sparkles className="w-3.5 h-3.5 text-primary" />
                Solana Wallet Cleaner
              </motion.div>

              <motion.h1
                custom={1}
                variants={fadeUp}
                className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight mb-5 text-foreground"
              >
                Your Solana Wallet is{" "}
                <span className="gradient-text">Hiding Money</span>.
              </motion.h1>

              <motion.p
                custom={2}
                variants={fadeUp}
                className="text-lg text-muted-foreground max-w-lg mx-auto lg:mx-0 mb-8 leading-relaxed"
              >
                Reclaim stuck SOL from empty token accounts and scam airdrops in seconds. Clean, Secure, and Instant.
              </motion.p>

              <motion.div custom={3} variants={fadeUp} className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <motion.button
                  whileHover={{ scale: 1.03 }}
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
              </motion.div>

              <motion.p custom={4} variants={fadeUp} className="mt-6 text-sm text-muted-foreground flex flex-wrap items-center gap-x-4 gap-y-1">
                <span>
                  💰 Over <span className="text-primary font-semibold">0.00204 SOL</span> recovered per account
                </span>
                <span className="text-border">|</span>
                <span className="flex items-center gap-1.5">
                  Total SOL Reclaimed:{" "}
                  <AnimatePresence mode="wait">
                    <motion.span
                      key={totalSolReclaimed}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.3, ease: "easeOut" }}
                      className="text-primary font-semibold tabular-nums"
                    >
                      {totalSolReclaimed.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} SOL
                    </motion.span>
                  </AnimatePresence>
                </span>
              </motion.p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.3 }}
            >
              <DustAnimation />
            </motion.div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <ScrollSection>
        <section id="how-it-works" className="py-24 px-4 relative">
          <div className="container mx-auto max-w-5xl">
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl font-extrabold mb-4 text-foreground">
                How It <span className="gradient-text">Works</span>
              </h2>
              <p className="text-muted-foreground text-lg max-w-md mx-auto">
                Three simple steps to a cleaner wallet.
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
        <section className="py-24 px-4 relative">
          <div className="container mx-auto max-w-5xl">
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl font-extrabold mb-4 text-foreground">
                Why <span className="gradient-text">Arsweep</span>?
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
      <section className="py-24 px-4 relative">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="container mx-auto max-w-2xl text-center glass rounded-3xl p-12 relative overflow-hidden"
        >
          <div className="orb w-40 h-40 bg-primary/20 -top-20 -left-20" />
          <div className="orb w-32 h-32 bg-secondary/20 -bottom-16 -right-16" />
          <h2 className="text-3xl sm:text-4xl font-extrabold mb-4 text-foreground relative z-10">
            Ready to <span className="gradient-text">clean up</span>?
          </h2>
          <p className="text-muted-foreground mb-8 relative z-10">
            Stop leaving SOL on the table. Start reclaiming in seconds.
          </p>
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={handleLaunch}
            className="gradient-bg gradient-bg-hover px-10 py-4 rounded-2xl text-primary-foreground font-semibold text-lg transition-all duration-200 shadow-lg relative z-10"
          >
            Launch Arsweep
          </motion.button>
        </motion.div>
      </section>
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
