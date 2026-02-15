import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";

const Hero = () => (
  <section className="relative pt-32 pb-16 px-4 text-center overflow-hidden">
    {/* Background orbs */}
    <div className="orb w-[400px] h-[400px] bg-primary/20 -top-40 -left-40 animate-pulse-glow" />
    <div className="orb w-[300px] h-[300px] bg-secondary/20 -top-20 right-0 animate-pulse-glow" style={{ animationDelay: "2s" }} />

    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, ease: "easeOut" }}
      className="relative z-10 max-w-2xl mx-auto"
    >
      <div className="inline-flex items-center gap-2 glass px-4 py-1.5 rounded-full text-sm text-muted-foreground mb-6">
        <Sparkles className="w-3.5 h-3.5 text-primary" />
        Solana Wallet Cleaner
      </div>
      <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight mb-4">
        Clean your wallet,{" "}
        <span className="gradient-text">reclaim your SOL</span>.
      </h1>
      <p className="text-lg text-muted-foreground max-w-md mx-auto mb-8">
        Find dust tokens and empty accounts. Close them and get your rent deposits back instantly.
      </p>
      <motion.button
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
        className="gradient-bg gradient-bg-hover px-8 py-3.5 rounded-2xl text-primary-foreground font-semibold text-base transition-all duration-200 shadow-lg"
      >
        Start Scanning
      </motion.button>
    </motion.div>
  </section>
);

export default Hero;
