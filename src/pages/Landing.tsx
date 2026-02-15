import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Shield, Github, Users, Wallet, Search, Sparkles, ArrowRight, ChevronRight, MessageCircle, X } from "lucide-react";
import { useRef } from "react";
import ArsweepLogo from "@/components/ArsweepLogo";

// Social icon components
const TwitterIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 4l11.733 16h4.267l-11.733 -16z" /><path d="M4 20l6.768 -6.768" /><path d="M20 4l-6.768 6.768" />
  </svg>
);
const YoutubeIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="5" width="20" height="14" rx="2" /><polygon points="10,8.5 16,12 10,15.5" />
  </svg>
);
const InstagramIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="20" height="20" rx="5" /><circle cx="12" cy="12" r="5" /><circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" />
  </svg>
);
const DiscordIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 12a1 1 0 1 0 0 2 1 1 0 0 0 0-2zm6 0a1 1 0 1 0 0 2 1 1 0 0 0 0-2z" fill="currentColor" />
    <path d="M8.5 17c0 0 1.5 2 3.5 2s3.5-2 3.5-2" /><path d="M18.4 7.3a16 16 0 0 0-4-1.3l-.5 1a12.5 12.5 0 0 0-3.8 0l-.5-1a16 16 0 0 0-4 1.3A17.2 17.2 0 0 0 3 18c1.5 1.2 3.8 2 6 2l.7-1.3A10.5 10.5 0 0 1 6 17.5l.5-.4c2.8 1.3 6.2 1.3 9 0l.5.4a10.5 10.5 0 0 1-3.7 1.2L13 20c2.2 0 4.5-.8 6-2a17.2 17.2 0 0 0-2.6-10.7z" />
  </svg>
);

// Scroll-triggered section wrapper with fade in/out
const ScrollSection = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <motion.div
    initial={{ opacity: 0, y: 40 }}
    whileInView={{ opacity: 1, y: 0 }}
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
            <ArsweepLogo className="w-8 h-8" />
            <span className="text-xl font-bold gradient-text">Arsweep</span>
          </div>
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

              <motion.p custom={4} variants={fadeUp} className="mt-6 text-sm text-muted-foreground">
                💰 Over <span className="text-primary font-semibold">0.00204 SOL</span> recovered per account
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
        <footer className="py-12 px-4 border-t border-border">
          <div className="container mx-auto max-w-5xl flex flex-col items-center gap-8">
            <div className="flex items-center gap-3">
              <ArsweepLogo className="w-7 h-7" />
              <span className="text-lg font-bold gradient-text">Arsweep</span>
            </div>

            {/* Social Icons */}
            <div className="flex items-center gap-5">
              {[
                { Icon: TwitterIcon, href: "#", label: "X (Twitter)" },
                { Icon: YoutubeIcon, href: "#", label: "YouTube" },
                { Icon: InstagramIcon, href: "#", label: "Instagram" },
                { Icon: DiscordIcon, href: "#", label: "Discord" },
              ].map(({ Icon, href, label }) => (
                <motion.a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  whileHover={{ scale: 1.15 }}
                  whileTap={{ scale: 0.95 }}
                  className="glass w-11 h-11 rounded-xl flex items-center justify-center text-muted-foreground transition-all duration-300 hover:text-primary hover:glow-primary"
                >
                  <Icon />
                </motion.a>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-2 text-sm text-muted-foreground">
              <span>© 2024 Arsweep. All rights reserved.</span>
              <span className="hidden sm:inline">·</span>
              <span>Built for the Solana community.</span>
            </div>
          </div>
        </footer>
      </ScrollSection>

      {/* Customer Service FAB */}
      <motion.button
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 1, type: "spring", stiffness: 200 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full gradient-bg shadow-lg flex items-center justify-center text-primary-foreground hover:shadow-[0_0_30px_hsla(162,93%,51%,0.3)] transition-shadow duration-300"
        aria-label="Customer Support"
      >
        <MessageCircle className="w-6 h-6" />
      </motion.button>
    </div>
  );
};

export default Landing;
