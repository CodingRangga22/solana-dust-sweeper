import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Shield, Eye, Lock, Server, Cookie, Mail, ArrowLeft, ChevronRight } from "lucide-react";
import ArsweepLogo from "@/components/ArsweepLogo";
import PremiumFooter from "@/components/PremiumFooter";

const sections = [
  {
    id: "overview",
    icon: Shield,
    title: "Overview",
    content: [
      "Arsweep is a non-custodial Solana tool. We are built on a simple principle: your keys, your crypto. We never request, store, or transmit your private keys or seed phrases under any circumstance.",
      "All sweep operations are fully on-chain, initiated and signed exclusively by you through your connected wallet. Arsweep acts only as an interface — it cannot move funds without your explicit approval.",
    ],
  },
  {
    id: "data",
    icon: Eye,
    title: "What We Collect",
    content: [
      "We collect minimal, anonymized data to improve the product experience. This may include: browser type and version, device category (desktop/mobile), and aggregated, anonymized usage patterns such as pages visited and features used.",
      "We do not collect: wallet private keys or seed phrases, personally identifiable information (name, email, ID), financial account details, or any data that can be traced back to an individual user.",
    ],
  },
  {
    id: "wallet",
    icon: Lock,
    title: "Wallet Interaction",
    content: [
      "Arsweep reads only your public wallet address and associated token account data via public Solana RPC nodes. This data is already publicly available on the Solana blockchain and does not constitute private information.",
      "Every transaction requires your explicit approval through your wallet provider (Phantom, Solflare, etc.). We will never initiate or request signing permissions beyond the minimum required for the specific action you choose to take.",
    ],
  },
  {
    id: "third-party",
    icon: Server,
    title: "Third-Party Services",
    content: [
      "Arsweep utilises public Solana RPC endpoints and may integrate third-party analytics tools for performance monitoring. These services operate under their own privacy policies.",
      "We do not sell, trade, or otherwise transfer your data to third parties for advertising or commercial purposes. Any data shared with service providers is limited to what is strictly necessary for product operation.",
    ],
  },
  {
    id: "cookies",
    icon: Cookie,
    title: "Cookies & Storage",
    content: [
      "We use browser local storage solely for functional purposes: saving your UI preferences (theme, settings) and maintaining session state. No third-party tracking cookies are used.",
      "You can clear this data at any time through your browser settings. Doing so will reset your preferences but will not affect your on-chain data in any way.",
    ],
  },
  {
    id: "contact",
    icon: Mail,
    title: "Contact",
    content: [
      "If you have questions or concerns about this Privacy Policy or how your data is handled, we want to hear from you. The best way to reach us is through our community channels.",
    ],
    links: [
      { label: "Join Discord", href: "https://discord.gg/D2rtvK3fBs" },
      { label: "Follow on X", href: "https://x.com/Arsweep_Agent" },
    ],
  },
];

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.5, ease: "easeOut" },
  }),
};

const PrivacyPolicy = () => (
  <div className="min-h-screen bg-background text-foreground">
    <header className="sticky top-0 z-40 border-b border-border/50 bg-background/80 backdrop-blur-xl">
      <div className="container mx-auto max-w-6xl px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5 hover:opacity-80 transition-opacity">
          <ArsweepLogo className="w-8 h-8" />
          <span className="text-lg font-bold gradient-text">Arsweep</span>
        </Link>
        <Link to="/" className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>
      </div>
    </header>

    <section className="relative py-20 px-4 overflow-hidden">
      <div className="orb w-96 h-96 bg-primary/10 -top-48 -left-48 absolute" />
      <div className="orb w-64 h-64 bg-secondary/10 top-0 right-0 absolute" />
      <div className="container mx-auto max-w-3xl relative z-10">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: "easeOut" }}>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-medium mb-6">
            <Shield className="w-3.5 h-3.5" />
            Legal · Privacy
          </div>
          <h1 className="text-5xl sm:text-6xl font-extrabold tracking-tight mb-4">
            Privacy <span className="gradient-text">Policy</span>
          </h1>
          <p className="text-muted-foreground text-lg leading-relaxed max-w-2xl">
            We built Arsweep to be trustless by design. Here's exactly what we collect, what we don't, and why.
          </p>
          <div className="mt-6 flex items-center gap-3 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              Effective March 2025
            </span>
            <ChevronRight className="w-3.5 h-3.5" />
            <span>Version 1.0</span>
          </div>
        </motion.div>
      </div>
    </section>

    <section className="px-4 mb-16">
      <div className="container mx-auto max-w-3xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.5 }} className="glass rounded-2xl p-6 border border-primary/20">
          <p className="text-xs font-semibold text-primary uppercase tracking-widest mb-4">TL;DR — The Short Version</p>
          <div className="grid sm:grid-cols-3 gap-4 text-sm">
            {[
              { icon: "🔑", text: "We never access private keys" },
              { icon: "📊", text: "Only anonymized usage data" },
              { icon: "🚫", text: "Zero data sold to third parties" },
            ].map((item) => (
              <div key={item.text} className="flex items-center gap-2.5 text-muted-foreground">
                <span className="text-base">{item.icon}</span>
                <span>{item.text}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>

    <main className="px-4 pb-24">
      <div className="container mx-auto max-w-3xl space-y-6">
        {sections.map((section, i) => (
          <motion.div key={section.id} custom={i} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }} variants={fadeUp} className="glass rounded-2xl p-8 hover:border-primary/20 transition-colors border border-border">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl gradient-bg flex items-center justify-center shrink-0 mt-0.5">
                <section.icon className="w-5 h-5 text-primary-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-xs font-mono text-muted-foreground">0{i + 1}</span>
                  <h2 className="text-xl font-bold text-foreground">{section.title}</h2>
                </div>
                <div className="space-y-3">
                  {section.content.map((para, j) => (
                    <p key={j} className="text-muted-foreground leading-relaxed text-sm">{para}</p>
                  ))}
                </div>
                {section.links && (
                  <div className="flex flex-wrap gap-3 mt-5">
                    {section.links.map((link) => (
                      <a key={link.label} href={link.href} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary/10 border border-primary/20 text-primary text-sm font-medium hover:bg-primary/20 transition-colors">
                        {link.label}
                        <ChevronRight className="w-3.5 h-3.5" />
                      </a>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </main>
    <PremiumFooter />
  </div>
);

export default PrivacyPolicy;
