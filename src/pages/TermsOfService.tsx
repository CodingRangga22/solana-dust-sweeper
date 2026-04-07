import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { FileText, Wallet, Coins, AlertTriangle, RefreshCw, Scale, Mail, ArrowLeft, ChevronRight } from "lucide-react";
import ArsweepLogo from "@/components/ArsweepLogo";
import PremiumFooter from "@/components/PremiumFooter";

const sections = [
  {
    id: "acceptance",
    icon: FileText,
    title: "Acceptance of Terms",
    content: [
      "By accessing or using Arsweep, you confirm that you have read, understood, and agree to be bound by these Terms of Service. If you do not agree to these terms, please discontinue use of the platform immediately.",
      "These terms apply to all visitors, users, and others who access or use Arsweep. We reserve the right to update these terms at any time. Continued use of the platform following any changes constitutes your acceptance of the revised terms.",
    ],
  },
  {
    id: "service",
    icon: Wallet,
    title: "Description of Service",
    content: [
      "Arsweep is a non-custodial web application built on the Solana blockchain. It enables users to identify and close empty token accounts — accounts with zero token balance — and recover the SOL rent deposits locked within them.",
      "Arsweep is an interface only. It does not hold, custody, or control any user funds. All on-chain interactions are executed solely by you through your connected wallet. Arsweep has no ability to initiate transactions or access funds without your explicit approval.",
    ],
  },
  {
    id: "fees",
    icon: Coins,
    title: "Fees & Costs",
    content: [
      "Arsweep charges a platform fee of 1.5% on the total SOL reclaimed per sweep operation. This fee is deducted automatically during the transaction and is clearly displayed before you confirm any action.",
      "Standard Solana network fees (transaction fees / gas) are separate and paid directly to the Solana network. These are not collected by Arsweep. Fee structures may be updated with prior notice to users.",
    ],
    highlight: "1.5% platform fee · ~0.002 SOL per account · Network fees apply",
  },
  {
    id: "risks",
    icon: AlertTriangle,
    title: "Risks & Responsibilities",
    content: [
      "Blockchain transactions are irreversible. Once an account is closed on-chain, it cannot be undone. Arsweep only closes accounts that are verified to have a zero token balance, but you are responsible for reviewing and confirming all accounts before proceeding.",
      "We strongly recommend using the Simulation feature before executing any live sweep. You are solely responsible for any losses arising from your use of the platform, including but not limited to: user error, incorrect account selection, or network failures.",
    ],
  },
  {
    id: "changes",
    icon: RefreshCw,
    title: "Changes to the Service",
    content: [
      "Arsweep is under active development. We may modify, suspend, or discontinue any aspect of the service at any time, with or without notice. We will make reasonable efforts to communicate significant changes through our Telegram and official channels.",
      "We are not liable for any inconvenience or loss resulting from service modifications, downtime, or discontinuation.",
    ],
  },
  {
    id: "liability",
    icon: Scale,
    title: "Limitation of Liability",
    content: [
      "Arsweep is provided on an \"as is\" and \"as available\" basis, without any warranties of any kind, either express or implied. We do not warrant that the service will be uninterrupted, error-free, or free of harmful components.",
      "To the maximum extent permitted by applicable law, Arsweep and its contributors shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including loss of funds, arising from your use of — or inability to use — the service.",
    ],
  },
  {
    id: "contact",
    icon: Mail,
    title: "Contact",
    content: [
      "Questions about these Terms? We are transparent about how we operate and welcome any enquiries. Reach us through our official community channels.",
    ],
    links: [
      { label: "Telegram Community", href: "https://t.me/arsweepalert" },
      { label: "Follow on X", href: "https://x.com/Arsweep_AI" },
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

const TermsOfService = () => (
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
      <div className="orb w-96 h-96 bg-secondary/10 -top-48 -right-48 absolute" />
      <div className="orb w-64 h-64 bg-primary/10 top-0 left-0 absolute" />
      <div className="container mx-auto max-w-3xl relative z-10">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: "easeOut" }}>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-secondary/10 border border-secondary/20 text-secondary text-xs font-medium mb-6">
            <FileText className="w-3.5 h-3.5" />
            Legal · Terms
          </div>
          <h1 className="text-5xl sm:text-6xl font-extrabold tracking-tight mb-4">
            Terms of <span className="gradient-text">Service</span>
          </h1>
          <p className="text-muted-foreground text-lg leading-relaxed max-w-2xl">
            Plain language. No legalese. Here is what you agree to when you use Arsweep.
          </p>
          <div className="mt-6 flex items-center gap-3 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-secondary animate-pulse" />
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
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.5 }} className="glass rounded-2xl p-6 border border-secondary/20">
          <p className="text-xs font-semibold text-secondary uppercase tracking-widest mb-4">TL;DR — The Short Version</p>
          <div className="grid sm:grid-cols-3 gap-4 text-sm">
            {[
              { icon: "🔐", text: "Non-custodial, always" },
              { icon: "✅", text: "You approve every transaction" },
              { icon: "⛓️", text: "On-chain actions are irreversible" },
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
                {"highlight" in section && section.highlight && (
                  <div className="mt-4 px-4 py-3 rounded-xl bg-primary/5 border border-primary/15 text-sm font-mono text-primary">
                    {section.highlight}
                  </div>
                )}
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

export default TermsOfService;
