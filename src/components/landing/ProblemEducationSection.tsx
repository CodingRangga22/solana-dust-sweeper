import { motion } from "framer-motion";
import { Coins, Database, Layers, RefreshCw } from "lucide-react";

const points = [
  {
    icon: Coins,
    title: "Solana requires rent deposits",
    text: "When you create a token account on Solana, you pay a one-time rent deposit in SOL. This keeps the account on-chain.",
  },
  {
    icon: Database,
    title: "Even empty accounts hold SOL",
    text: "An account with zero tokens still holds its rent deposit. The SOL stays locked until the account is closed.",
  },
  {
    icon: Layers,
    title: "Many users accumulate dust accounts",
    text: "Scam airdrops, abandoned tokens, and test mints create empty accounts. Over time, these add up.",
  },
  {
    icon: RefreshCw,
    title: "Closing accounts refunds the SOL",
    text: "When you close a token account, Solana returns the full rent deposit to your wallet. Ars​weep helps you reclaim it.",
  },
];

const ProblemEducationSection = () => (
  <motion.section
    initial={{ opacity: 0, y: 40 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, amount: 0.1 }}
    transition={{ duration: 0.6, ease: "easeOut" }}
    className="py-24 px-4 relative"
  >
    <div className="container mx-auto max-w-5xl">
      <div className="text-center mb-16">
        <h2 className="text-3xl sm:text-4xl font-extrabold mb-4 text-foreground">
          Why Is Your <span className="gradient-text">SOL Locked</span>?
        </h2>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          A simple breakdown for Web3 beginners.
        </p>
      </div>

      <div className="grid sm:grid-cols-2 gap-6">
        {points.map((point, i) => (
          <motion.div
            key={point.title}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ delay: i * 0.1, duration: 0.5 }}
            className="glass rounded-2xl p-6 flex gap-4 items-start group hover:glow-primary transition-shadow duration-300"
          >
            <div className="w-12 h-12 rounded-xl gradient-bg flex items-center justify-center shrink-0">
              <point.icon className="w-6 h-6 text-primary-foreground" />
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

export default ProblemEducationSection;