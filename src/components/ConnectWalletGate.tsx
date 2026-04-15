import { ReactNode } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, ShieldCheck, Sparkles, Wallet } from "lucide-react";
import ArsweepLogo from "@/components/ArsweepLogo";
import AnimatedScrambleText from "@/components/AnimatedScrambleText";

type ConnectWalletGateProps = {
  /** Primary CTA area (button or WalletMenu). */
  cta: ReactNode;
  /** Optional CTA helper text below. */
  helperText?: string;
  /** Show back-to-landing link. */
  showBackToLanding?: boolean;
  /** Override title/subtitle copy. */
  title?: string;
  subtitle?: string;
};

export default function ConnectWalletGate({
  cta,
  helperText = "By continuing, you’ll be prompted to select a wallet provider. No funds move without your confirmation.",
  showBackToLanding = true,
  title = "Connect your wallet",
  subtitle = "Log in to access Arsweep Agent tools, Premium x402 features, and sweep execution.",
}: ConnectWalletGateProps) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[#040506]">
      <div className="pointer-events-none fixed inset-0 z-0 arsweep-bg-ambient" aria-hidden />
      <div className="pointer-events-none fixed inset-0 z-0 arsweep-mesh-grid" aria-hidden />
      <div
        className="pointer-events-none fixed inset-0 z-0 bg-gradient-to-b from-transparent via-transparent to-[var(--ar-base)]"
        aria-hidden
      />

      {showBackToLanding ? (
        <Link
          to="/"
          className="group fixed left-4 top-4 z-20 inline-flex items-center gap-2 rounded-xl border border-white/[0.10] bg-white/[0.04] px-3 py-2 text-xs font-semibold text-white/70 backdrop-blur-xl transition-colors hover:border-white/25 hover:bg-white/[0.07] hover:text-white sm:left-6 sm:top-6"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          <span className="text-white/55 transition-colors group-hover:text-white/85">←</span>
          Back to Landing
        </Link>
      ) : null}

      <motion.div
        initial={{ opacity: 0, y: 16, filter: "blur(10px)" }}
        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 mx-auto flex min-h-screen w-full max-w-5xl items-center px-5 py-10 sm:px-8"
      >
        <div className="w-full">
          <div className="mx-auto max-w-xl text-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.05, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-2xl border border-white/[0.12] bg-gradient-to-br from-white/[0.10] via-white/[0.05] to-transparent shadow-[0_18px_60px_rgba(0,0,0,0.55)]"
            >
              <ArsweepLogo className="h-8 w-8 drop-shadow-[0_0_22px_rgba(255,255,255,0.18)]" />
            </motion.div>

            <motion.p
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.12, duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
              className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.04] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-white/50"
            >
              <ShieldCheck className="h-3 w-3 text-white/70" />
              <AnimatedScrambleText text="Secure · Solana-native" durationMs={700} delayMs={120} />
            </motion.p>

            <h1 className="mb-3 bg-gradient-to-br from-white via-white to-white/55 bg-clip-text text-3xl font-bold tracking-tight text-transparent sm:text-[2.1rem]">
              <AnimatedScrambleText text={title} durationMs={900} delayMs={80} />
            </h1>

            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.22, duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
              className="mx-auto mb-8 max-w-md font-mono text-xs leading-relaxed text-white/45"
            >
              <AnimatedScrambleText
                text={subtitle}
                durationMs={1050}
                delayMs={220}
                glyphs="ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789·"
              />
            </motion.p>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.28, duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
            className="mx-auto grid max-w-3xl grid-cols-1 gap-3 sm:grid-cols-3"
          >
            {[
              { icon: Sparkles, title: "AI Agent", desc: "Ask questions, analyze wallets, and get guided actions." },
              { icon: Wallet, title: "One wallet, one place", desc: "Use your Solana wallet for scanning + transactions." },
              { icon: ShieldCheck, title: "Non-custodial", desc: "You stay in control—transactions require your signature." },
            ].map((c) => (
              <div
                key={c.title}
                className="group relative overflow-hidden rounded-2xl border border-white/[0.10] bg-gradient-to-br from-white/[0.07] to-white/[0.02] p-4 shadow-lg shadow-black/40"
              >
                <span className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/0 via-transparent to-slate-400/0 opacity-0 transition-opacity group-hover:opacity-100 group-hover:from-white/10 group-hover:to-slate-500/5" />
                <div className="relative mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-white/12 to-white/[0.04] ring-1 ring-white/[0.10]">
                  <c.icon className="h-5 w-5 text-white/90" strokeWidth={2} />
                </div>
                <p className="relative mb-1 text-xs font-semibold tracking-tight text-white/90">{c.title}</p>
                <p className="relative text-[10px] leading-relaxed text-white/40">{c.desc}</p>
              </div>
            ))}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.36, duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
            className="mx-auto mt-8 flex max-w-xl flex-col items-center gap-3"
          >
            <div className="w-full max-w-sm">{cta}</div>

            <p className="text-center font-mono text-[10px] leading-relaxed text-white/35">
              {helperText}
            </p>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}

