import { motion } from "framer-motion";
import { Coins, Database, Lock, RefreshCw } from "lucide-react";

const points = [
  {
    icon: Coins,
    title: "Solana Rent Deposit System",
    text: "Solana uses a rent mechanism to keep accounts alive. When you create any account (including token accounts), you pay a one-time rent deposit in SOL.",
  },
  {
    icon: Database,
    title: "Token Account Rent Mechanics",
    text: "Each SPL token account costs ~0.002 SOL to create. This rent is locked as long as the account exists, regardless of whether it holds tokens or not.",
  },
  {
    icon: Lock,
    title: "Why Empty Accounts Still Hold SOL",
    text: "Even with zero token balance, the account's rent deposit stays locked. Scam airdrops and abandoned tokens leave these 'dust' accounts behind—and your SOL trapped.",
  },
  {
    icon: RefreshCw,
    title: "Closing Accounts Refunds SOL",
    text: "When you close a token account, Solana returns the full rent deposit to your wallet. Arsweep helps you find and close empty accounts to reclaim that SOL.",
  },
];

const EducationalSection = () => (
  <motion.section
    initial={{ opacity: 0, y: 40 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, amount: 0.1 }}
    transition={{ duration: 0.6, ease: "easeOut" }}
    className="py-24 px-4 relative"
  >
    <div className="container mx-auto max-w-4xl">
      <div className="text-center mb-12">
        <h2 className="text-3xl sm:text-4xl font-extrabold mb-4 text-foreground">
          Why Your Wallet Has <span className="gradient-text">Hidden SOL</span>
        </h2>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          A beginner-friendly breakdown of Solana&apos;s rent system and why dust accounts matter.
        </p>
      </div>

      <div className="space-y-6">
        {points.map((point, i) => (
          <motion.div
            key={point.title}
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ delay: i * 0.1, duration: 0.5 }}
            className="glass rounded-2xl p-6 flex gap-4 items-start"
          >
            <div className="w-10 h-10 rounded-xl gradient-bg flex items-center justify-center shrink-0">
              <point.icon className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h3 className="text-base font-bold text-foreground mb-2">{point.title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">{point.text}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  </motion.section>
);

export default EducationalSection;
