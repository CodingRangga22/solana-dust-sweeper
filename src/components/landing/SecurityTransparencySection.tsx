import { motion } from "framer-motion";
import { Shield, Eye, ExternalLink } from "lucide-react";

const items = [
  {
    icon: Shield,
    title: "Non-Custodial",
    description: "We never access or store private keys.",
  },
  {
    icon: Shield,
    title: "Wallet Signature Required",
    description: "Every transaction requires explicit user approval.",
  },
  {
    icon: Eye,
    title: "Public RPC Scan",
    description: "Scanning uses public blockchain data only.",
  },
  {
    icon: ExternalLink,
    title: "On-Chain Verifiable",
    description: "All transactions are verifiable on-chain via Solana Explorer.",
    href: "https://solscan.io",
  },
];

const SecurityTransparencySection = () => (
  <motion.section
    initial={{ opacity: 0, y: 40 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, amount: 0.15 }}
    transition={{ duration: 0.6, ease: "easeOut" }}
    className="py-24 px-4 relative"
  >
    <div className="container mx-auto max-w-5xl">
      <div className="text-center mb-16">
        <h2 className="text-3xl sm:text-4xl font-extrabold mb-4 text-foreground">
          Built for Security & <span className="gradient-text">Transparency</span>
        </h2>
        <p className="text-muted-foreground text-lg max-w-md mx-auto">
          Trust through transparency. No surprises, no hidden permissions.
        </p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {items.map((item, i) => (
          <motion.div
            key={item.title}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ delay: i * 0.1, duration: 0.5 }}
            className="glass rounded-2xl p-6 relative group hover:glow-primary transition-shadow duration-300"
          >
            <div className="w-12 h-12 rounded-xl gradient-bg flex items-center justify-center mb-4">
              <item.icon className="w-6 h-6 text-primary-foreground" />
            </div>
            <h3 className="text-lg font-bold mb-2 text-foreground">{item.title}</h3>
            <p className="text-muted-foreground text-sm leading-relaxed">{item.description}</p>
            {item.href && (
              <a
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 inline-flex items-center gap-1.5 text-sm text-primary hover:underline font-medium"
              >
                View on Solscan
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  </motion.section>
);

export default SecurityTransparencySection;
