import { useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Shield,
  Info,
  Percent,
  ArrowLeft,
  BookOpen,
  Cpu,
  HelpCircle,
  AlertTriangle,
  CheckCircle2,
  FileWarning,
  ShieldCheck,
} from "lucide-react";
import ArsweepLogo from "@/components/ArsweepLogo";
import ThemeToggle from "@/components/ThemeToggle";
import PremiumFooter from "@/components/PremiumFooter";
import { useBanner } from "@/components/BannerProvider";

const SIDEBAR_ITEMS = [
  { id: "intro", title: "Introduction", icon: BookOpen },
  { id: "technical", title: "Technical Specs", icon: Cpu },
  { id: "security", title: "Security", icon: Shield },
  { id: "security-audit", title: "Security Audit", icon: ShieldCheck },
  { id: "fees", title: "Fees", icon: Percent },
  { id: "faq", title: "FAQ", icon: HelpCircle },
  { id: "disclaimer", title: "Disclaimer", icon: FileWarning },
];

type CalloutType = "info" | "warning" | "success";

const Callout = ({
  type,
  title,
  children,
}: {
  type: CalloutType;
  title: string;
  children: React.ReactNode;
}) => {
  const styles = {
    info: {
      wrapper: "border-primary/40 bg-primary/5",
      icon: Info,
      iconColor: "text-primary",
    },
    warning: {
      wrapper: "border-amber-500/40 bg-amber-500/5",
      icon: AlertTriangle,
      iconColor: "text-amber-500",
    },
    success: {
      wrapper: "border-emerald-500/40 bg-emerald-500/5",
      icon: CheckCircle2,
      iconColor: "text-emerald-500",
    },
  };
  const s = styles[type];
  const Icon = s.icon;
  return (
    <div className={`rounded-xl border-l-4 p-4 ${s.wrapper}`}>
      <div className="flex gap-3">
        <Icon className={`w-5 h-5 shrink-0 mt-0.5 ${s.iconColor}`} />
        <div>
          <p className="font-semibold text-foreground mb-1">{title}</p>
          <div className="text-sm text-muted-foreground leading-relaxed">{children}</div>
        </div>
      </div>
    </div>
  );
};

const fadeIn = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.06 + 0.1, duration: 0.4, ease: "easeOut" },
  }),
};

const Docs = () => {
  const contentRef = useRef<HTMLDivElement>(null);
  const { bannerHeight } = useBanner();

  useEffect(() => {
    const hash = window.location.hash.slice(1);
    if (hash && contentRef.current) {
      setTimeout(() => {
        const el = document.getElementById(hash);
        el?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    }
  }, []);

  return (
    <div className="relative min-h-screen bg-background overflow-hidden">
      {/* Ambient orbs */}
      <div className="orb w-[600px] h-[600px] bg-primary/8 top-1/4 -right-60 animate-pulse-glow" />
      <div className="orb w-[500px] h-[500px] bg-secondary/8 bottom-1/3 -left-40 animate-pulse-glow" style={{ animationDelay: "2s" }} />

      {/* Top bar */}
      <header
        className="fixed left-0 right-0 z-50 glass border-b border-border transition-[top] duration-200"
        style={{ top: bannerHeight }}
      >
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/" className="flex items-center gap-3 hover:opacity-90 transition-opacity">
              <ArsweepLogo className="w-8 h-8" />
              <span className="text-xl font-bold gradient-text">Arsweep</span>
            </Link>
            <ThemeToggle />
            <Link
              to="/app"
              className="flex items-center gap-2 glass glass-hover px-4 py-2 rounded-xl text-sm font-medium text-foreground hover:text-primary transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to App
            </Link>
          </div>
        </div>
      </header>

      {/* Main layout: sidebar + content */}
      <div className="pt-24 pb-20 px-4">
        <div className="container mx-auto max-w-6xl flex flex-col lg:flex-row gap-8 lg:gap-10">
          {/* Left sidebar - GitBook style */}
          <motion.aside
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.35 }}
            className="lg:w-56 shrink-0"
          >
            <nav className="glass rounded-2xl p-4 sticky top-24 backdrop-blur-xl">
              <div className="flex items-center gap-2 mb-4 px-2">
                <BookOpen className="w-4 h-4 text-primary" />
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  On this page
                </span>
              </div>
              <ul className="space-y-0.5">
                {SIDEBAR_ITEMS.map((item) => (
                  <li key={item.id}>
                    <a
                      href={`#${item.id}`}
                      className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:text-primary hover:bg-primary/5 transition-colors"
                    >
                      <item.icon className="w-3.5 h-3.5 shrink-0" />
                      {item.title}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          </motion.aside>

          {/* Right content - Glassmorphism card */}
          <main ref={contentRef} className="flex-1 min-w-0 max-w-3xl">
            <motion.article
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4 }}
              className="glass rounded-2xl p-6 sm:p-8 md:p-10 backdrop-blur-xl shadow-2xl"
            >
              {/* Intro */}
              <motion.section
                id="intro"
                custom={0}
                initial="hidden"
                animate="visible"
                variants={fadeIn}
                className="scroll-mt-28 mb-12"
              >
                <h1 className="text-3xl sm:text-4xl font-extrabold text-foreground mb-4 tracking-tight">
                  Arsweep Documentation
                </h1>
                <p className="text-lg text-muted-foreground leading-relaxed mb-6">
                  Arsweep is a <strong className="text-foreground">Solana Wallet Hygiene</strong> tool.
                  It helps you reclaim stuck SOL from empty token accounts, keeping your wallet clean
                  and your funds where they belong.
                </p>
                <Callout type="info" title="Quick start">
                  Connect your wallet, scan for dust, select accounts to close, and confirm the sweep.
                  Your reclaimed rent is sent directly to your main wallet.
                </Callout>
              </motion.section>

              {/* Technical Specs */}
              <motion.section
                id="technical"
                custom={1}
                initial="hidden"
                animate="visible"
                variants={fadeIn}
                className="scroll-mt-28 mb-12"
              >
                <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
                  <Cpu className="w-6 h-6 text-primary" />
                  Technical Specs
                </h2>

                <h3 className="text-lg font-semibold text-foreground mt-6 mb-2">
                  The Rent-Exempt Logic
                </h3>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  Accounts on Solana need to store data. To do so, they must hold a minimum balance
                  called <strong className="text-foreground">rent</strong>. For an SPL Token account,
                  this is exactly <code className="px-1.5 py-0.5 rounded bg-muted text-foreground text-sm font-mono">0.00203928 SOL</code>.
                  When a user sells all their tokens, the account remains <em>open</em> and <em>empty</em>,
                  holding that SOL hostage.
                </p>

                <Callout type="info" title="Rent-exempt minimum">
                  The 0.00203928 SOL per account is the minimum required to keep the account from being
                  purged by the network. It is fully reclaimable when you close the account.
                </Callout>

                <h3 className="text-lg font-semibold text-foreground mt-8 mb-2">
                  The Sweep Mechanism
                </h3>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  Arsweep uses the <code className="px-1.5 py-0.5 rounded bg-muted text-foreground text-sm font-mono">CloseAccount</code> instruction
                  from the SPL Token program. This is a <strong className="text-foreground">native Solana instruction</strong>,
                  making it 100% safe and standard. When executed, the account is closed and the rent
                  deposit is sent to a destination address you specify—typically your main wallet.
                </p>

                <Callout type="success" title="Standard operation">
                  CloseAccount is part of the official SPL Token program used by all Solana wallets and DApps.
                  No custom code or external programs are involved in the close operation.
                </Callout>
              </motion.section>

              {/* Security */}
              <motion.section
                id="security"
                custom={2}
                initial="hidden"
                animate="visible"
                variants={fadeIn}
                className="scroll-mt-28 mb-12"
              >
                <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
                  <Shield className="w-6 h-6 text-primary" />
                  Security Protocol
                </h2>

                <ul className="space-y-4 text-muted-foreground leading-relaxed">
                  <li>
                    <strong className="text-foreground">Non-Custodial:</strong> Arsweep never asks
                    for your private keys. Your wallet stays in your control at all times.
                  </li>
                  <li>
                    <strong className="text-foreground">Limited Permissions:</strong> The transaction
                    only requests to close empty accounts. It does not transfer your main SOL or any
                    tokens with a balance.
                  </li>
                  <li>
                    <strong className="text-foreground">Open Source:</strong> Our codebase is
                    publicly available. The{" "}
                    <a
                      href="https://github.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      GitHub repository
                    </a>{" "}
                    serves as the source of truth. Audit it yourself.
                  </li>
                </ul>

                <Callout type="success" title="Trust through transparency">
                  Anyone can verify Arsweep&apos;s behavior by reading the source code. We believe in
                  security through openness.
                </Callout>
              </motion.section>

              {/* Security Audit */}
              <motion.section
                id="security-audit"
                custom={3}
                initial="hidden"
                animate="visible"
                variants={fadeIn}
                className="scroll-mt-28 mb-12"
              >
                <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
                  <ShieldCheck className="w-6 h-6 text-primary" />
                  Security Audit
                </h2>

                <h3 className="text-lg font-semibold text-foreground mt-6 mb-2">
                  Solana Instructions Used
                </h3>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  Arsweep uses exactly <strong className="text-foreground">one</strong> Solana instruction:
                </p>
                <div className="rounded-xl bg-muted/50 p-4 font-mono text-sm mb-4">
                  <p className="text-foreground">spl-token: <strong>CloseAccount</strong></p>
                  <p className="text-muted-foreground mt-1 text-xs">
                    <code>createCloseAccountInstruction</code> from <code>@solana/spl-token</code>
                  </p>
                </div>
                <p className="text-muted-foreground leading-relaxed mb-6">
                  This is the official SPL Token program instruction for closing token accounts and
                  reclaiming rent. No custom programs or third-party instructions are used.
                </p>

                <h3 className="text-lg font-semibold text-foreground mt-6 mb-2">
                  Stateless Architecture
                </h3>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  Arsweep uses a <strong className="text-foreground">Stateless Architecture</strong>—meaning
                  we do not store any user data or wallet addresses on a database. All operations happen
                  client-side in your browser. Wallet connections, token scans, and transaction signing
                  occur locally. We never transmit, log, or persist your wallet address or any
                  identifying information.
                </p>

                <Callout type="success" title="Zero server-side user data">
                  No backend database. No analytics tied to wallet addresses. Your activity stays between
                  you and the Solana network.
                </Callout>

                <h3 className="text-lg font-semibold text-foreground mt-8 mb-2">
                  Content Security Policy (CSP) for Deployment
                </h3>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  When deploying Arsweep, we recommend adding a Content Security Policy header to
                  prevent unauthorized scripts from running. This reduces the risk of XSS and
                  injected malware:
                </p>
                <pre className="rounded-xl bg-muted p-4 text-xs font-mono text-foreground overflow-x-auto mb-4">
{`Content-Security-Policy:
  default-src 'self';
  script-src 'self' 'unsafe-inline' 'unsafe-eval' https://*.solana.com;
  connect-src 'self' https://api.devnet.solana.com https://api.mainnet-beta.solana.com;
  style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
  font-src https://fonts.gstatic.com;
  img-src 'self' data: https:;
  frame-ancestors 'none';
  base-uri 'self';
  form-action 'self';`}
                </pre>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Adjust RPC endpoints (<code className="px-1 rounded bg-muted">connect-src</code>) to
                  match your deployment (e.g., custom RPC providers). Review and tighten these directives
                  for your specific hosting environment.
                </p>
              </motion.section>

              {/* Fees */}
              <motion.section
                id="fees"
                custom={4}
                initial="hidden"
                animate="visible"
                variants={fadeIn}
                className="scroll-mt-28 mb-12"
              >
                <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
                  <Percent className="w-6 h-6 text-primary" />
                  Fee Transparency
                </h2>

                <p className="text-muted-foreground leading-relaxed mb-4">
                  A small <strong className="text-foreground">1.5% service fee</strong> is deducted
                  from the reclaimed rent. This covers:
                </p>
                <ul className="list-disc list-inside text-muted-foreground space-y-1 mb-4 ml-2">
                  <li>RPC costs for scanning and broadcasting transactions</li>
                  <li>Hosting and infrastructure</li>
                  <li>Continuous development and maintenance of the tool</li>
                </ul>
                <p className="text-muted-foreground leading-relaxed">
                  The remaining <strong className="text-foreground">98.5%</strong> is sent directly
                  to you. Network gas fees are separate and typically minimal.
                </p>

                <Callout type="info" title="Fee breakdown">
                  Gross refund (e.g. 0.0204 SOL) − 1.5% service fee − network gas ≈ Net SOL you receive.
                </Callout>
              </motion.section>

              {/* FAQ */}
              <motion.section
                id="faq"
                custom={5}
                initial="hidden"
                animate="visible"
                variants={fadeIn}
                className="scroll-mt-28 mb-12"
              >
                <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
                  <HelpCircle className="w-6 h-6 text-primary" />
                  FAQ
                </h2>

                <div className="space-y-6">
                  <div>
                    <h4 className="font-semibold text-foreground mb-1">What tokens can I close?</h4>
                    <p className="text-sm text-muted-foreground">
                      Only accounts with zero or negligible balance (dust). Arsweep filters these automatically.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground mb-1">Is it safe?</h4>
                    <p className="text-sm text-muted-foreground">
                      Yes. Arsweep uses the standard SPL Token CloseAccount instruction. No custom programs.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground mb-1">When will I receive my SOL?</h4>
                    <p className="text-sm text-muted-foreground">
                      Immediately after the transaction is confirmed on-chain. Usually within seconds.
                    </p>
                  </div>
                </div>
              </motion.section>

              {/* Disclaimer - High-contrast Warning */}
              <motion.section
                id="disclaimer"
                custom={6}
                initial="hidden"
                animate="visible"
                variants={fadeIn}
                className="scroll-mt-28 border-t border-border pt-8"
              >
                <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
                  <FileWarning className="w-6 h-6 text-destructive" />
                  Disclaimer
                </h2>

                <div className="rounded-xl border-2 border-destructive/60 bg-destructive/10 p-6 space-y-5">
                  <div>
                    <h4 className="font-semibold text-foreground mb-1">1. No Financial Advice</h4>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      Arsweep is a technical utility tool for the Solana blockchain. Using this tool
                      to reclaim SOL rent does not constitute financial or investment advice.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground mb-1">2. Permanent Action Warning</h4>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      The process of closing a token account is irreversible. Once an account is closed,
                      any future incoming tokens of that type will require the creation of a new account
                      and a new rent deposit. Arsweep is not responsible for any missed airdrops sent
                      to closed accounts.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground mb-1">3. Security & Liability</h4>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      Arsweep is an open-source tool provided &quot;as-is&quot; without any warranties.
                      While we use standard SPL-Token instructions, users interact with the protocol
                      at their own risk. The developers are not liable for any loss of funds, failed
                      transactions, or unexpected wallet behavior.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground mb-1">4. Service Fees</h4>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      By using this service, you agree to a 1.5% service fee which is automatically
                      deducted from the reclaimed rent to support the platform&apos;s maintenance and
                      infrastructure.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground mb-1">5. User Responsibility</h4>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      It is the user&apos;s responsibility to ensure they are not closing accounts that
                      are still needed for active decentralized finance (DeFi) positions or expected
                      rewards.
                    </p>
                  </div>
                </div>
              </motion.section>
            </motion.article>
          </main>
        </div>
      </div>

      <PremiumFooter />
    </div>
  );
};

export default Docs;
