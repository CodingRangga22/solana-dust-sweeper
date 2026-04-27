import { useState, useRef } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";
import { ExternalLink } from "lucide-react";
import { useNavigate } from "react-router-dom";
import ArsweepLogo from "./ArsweepLogo";
import BrandWordmark from "./BrandWordmark";
import { isDevnet } from "@/config/env";

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
const TelegramIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 12a1 1 0 1 0 0 2 1 1 0 0 0 0-2zm6 0a1 1 0 1 0 0 2 1 1 0 0 0 0-2z" fill="currentColor" />
    <path d="M8.5 17c0 0 1.5 2 3.5 2s3.5-2 3.5-2" /><path d="M18.4 7.3a16 16 0 0 0-4-1.3l-.5 1a12.5 12.5 0 0 0-3.8 0l-.5-1a16 16 0 0 0-4 1.3A17.2 17.2 0 0 0 3 18c1.5 1.2 3.8 2 6 2l.7-1.3A10.5 10.5 0 0 1 6 17.5l.5-.4c2.8 1.3 6.2 1.3 9 0l.5.4a10.5 10.5 0 0 1-3.7 1.2L13 20c2.2 0 4.5-.8 6-2a17.2 17.2 0 0 0-2.6-10.7z" />
  </svg>
);

// Magnetic social icon
const MagneticIcon = ({ children, href, label }: { children: React.ReactNode; href: string; label: string }) => {
  const ref = useRef<HTMLAnchorElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 300, damping: 20 });
  const springY = useSpring(y, { stiffness: 300, damping: 20 });

  const handleMouse = (e: React.MouseEvent) => {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    x.set((e.clientX - rect.left - rect.width / 2) * 0.3);
    y.set((e.clientY - rect.top - rect.height / 2) * 0.3);
  };

  const reset = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.a
      ref={ref}
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      onMouseMove={handleMouse}
      onMouseLeave={reset}
      style={{
        x: springX,
        y: springY,
        width: 40,
        height: 40,
        borderRadius: 10,
        background: "var(--glass-bg)",
        border: "1px solid var(--glass-border)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "hsl(var(--muted-foreground))",
        transition: "border-color 0.2s, color 0.2s, background 0.2s",
        cursor: "pointer",
      }}
      whileTap={{ scale: 0.9 }}
    >
      {children}
    </motion.a>
  );
};

const PremiumFooter = () => {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);
  const navigate = useNavigate();

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
      setEmail("");
      setTimeout(() => setSubscribed(false), 3000);
    }
  };

  return (
    <footer
      className="text-foreground"
      style={{
        position: "relative",
        borderTop: "1px solid hsl(var(--border))",
        backgroundColor: "hsl(var(--background))",
        backgroundImage:
          // Light: subtle ink vignette. Dark: keep tech-noir bloom.
          "radial-gradient(ellipse 80% 60% at 50% 0%, color-mix(in oklab, hsl(var(--foreground)) 8%, transparent), transparent 62%), radial-gradient(ellipse 55% 55% at 15% 40%, color-mix(in oklab, hsl(var(--foreground)) 6%, transparent), transparent 68%), radial-gradient(ellipse 55% 55% at 85% 55%, color-mix(in oklab, hsl(var(--foreground)) 5%, transparent), transparent 70%)",
      }}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-px"
        style={{
          background:
            "linear-gradient(90deg, transparent, color-mix(in oklab, hsl(var(--foreground)) 14%, transparent), transparent)",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-20"
        style={{
          background:
            "radial-gradient(ellipse 70% 60% at 50% 0%, color-mix(in oklab, hsl(var(--foreground)) 8%, transparent), transparent 72%)",
        }}
      />
      <div style={{ padding: "64px 32px" }}>
        {/* Faint noise texture overlay */}
        <div className="absolute inset-0 opacity-[0.02]" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.5'/%3E%3C/svg%3E\")" }} />

        <div className="container mx-auto max-w-6xl relative z-10">
          {/* 4-Column Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-8 mb-12 overflow-hidden">
            {/* Col 1: Brand & Newsletter */}
            <div className="space-y-5 min-w-0">
              <div className="flex items-center gap-3" translate="no">
                <motion.div
                  animate={{
                    filter: [
                      "brightness(1) drop-shadow(0 0 0px transparent)",
                      "brightness(1.12) drop-shadow(0 0 16px color-mix(in oklab, hsl(var(--foreground)) 18%, transparent))",
                      "brightness(1) drop-shadow(0 0 0px transparent)",
                    ],
                  }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                >
                  <ArsweepLogo className="w-8 h-8" />
                </motion.div>
                <BrandWordmark />
              </div>
              <p style={{ fontSize: 13, color: "hsl(var(--muted-foreground))", lineHeight: 1.7 }}>
                The most trusted Solana wallet cleaner. Reclaim hidden SOL from dust accounts.
              </p>
              <form onSubmit={handleSubscribe} className="space-y-2 relative z-10">
                <p className="text-xs font-semibold text-foreground uppercase tracking-wider">Join Newsletter</p>
                <div className="flex gap-2 w-full max-w-[240px]">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    className="min-w-0 flex-1 bg-muted/30 border border-border rounded-xl px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-primary/50 transition-colors"
                    required
                  />
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    type="submit"
                    className="gradient-bg gradient-bg-hover px-3 py-2 rounded-xl text-primary-foreground text-xs font-semibold whitespace-nowrap shrink-0"
                  >
                    {subscribed ? "✓" : "Subscribe"}
                  </motion.button>
                </div>
              </form>
            </div>

            {/* Col 2: Product */}
            <div className="space-y-4 min-w-0">
              <p className="text-xs font-semibold text-foreground uppercase tracking-wider">Product</p>
              <ul className="space-y-2.5">
                {[
                  { label: "ASWP Token", onClick: () => navigate("/token") },
                  { label: "x402 APIs", onClick: () => navigate("/x402") },
                  { label: "Stats (Proof)", onClick: () => navigate("/stats") },
                  { label: "Dashboard", onClick: () => navigate("/app") },
                  { label: "Simulation", onClick: () => navigate("/simulation") },
                  { label: "Direct Sweep", onClick: () => navigate("/app") },
                  { label: "Documentation", onClick: () => navigate("/docs") },
                ].map((item) => (
                  <li key={item.label}>
                    <button
                      type="button"
                      onClick={item.onClick}
                      style={{ fontSize: 13, color: "hsl(var(--muted-foreground))" }}
                      className="hover:text-primary transition-colors duration-200 text-left w-full"
                    >
                      {item.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Col 3: Legal & Ecosystem */}
            <div className="space-y-4 min-w-0">
              <p className="text-xs font-semibold text-foreground uppercase tracking-wider">Legal & Resources</p>
              <ul className="space-y-2.5">
                {[
                  { label: "Privacy Policy", href: "/privacy" },
                  { label: "Terms of Service", href: "/terms" },
                  { label: "Contact", href: "mailto:contact@arsweep.io" },
                  { label: "Telegram Community", href: "https://t.me/arsweepalert" },
                  { label: "Solana Explorer", href: isDevnet ? "https://explorer.solana.com/?cluster=devnet" : "https://explorer.solana.com" },
                ].map((item) => (
                  <li key={item.label}>
                    <a
                      href={item.href}
                      {...(item.href.startsWith("http")
                        ? { target: "_blank", rel: "noopener noreferrer" }
                        : {})}
                      style={{ fontSize: 13, color: "hsl(var(--muted-foreground))" }}
                      className="hover:text-primary transition-colors duration-200 flex items-center gap-1.5 group"
                    >
                      {item.label}
                      <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Col 4: Community & Status */}
            <div className="space-y-5 min-w-0">
              <div className="space-y-4">
                <p className="text-xs font-semibold text-foreground uppercase tracking-wider">Community</p>
                <div className="flex items-center gap-3" translate="no">
                  <MagneticIcon href="https://x.com/Arsweep_Agent" label="X (Twitter)"><TwitterIcon /></MagneticIcon>
                  <MagneticIcon href="https://t.me/arsweepalert" label="Telegram"><TelegramIcon /></MagneticIcon>
                  <MagneticIcon href="https://t.me/ArsweepAi_bot" label="Telegram"><svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/></svg></MagneticIcon>
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-xs font-semibold text-foreground uppercase tracking-wider">Network</p>
                <div className="glass rounded-xl px-4 py-3 flex items-center gap-3">
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-primary" />
                  </span>
                  <div>
                    <p className="text-xs font-medium text-foreground">
                      {isDevnet ? "Solana Devnet" : "Solana Mainnet"}
                    </p>
                    <p className="text-[10px] text-primary">Online</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="border-t border-border pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "hsl(var(--muted-foreground))" }}>
              © 2026 Arsweep. All rights reserved.
            </p>
            <p style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "hsl(var(--muted-foreground))" }}>
              Built with ❤️ by Arsweep Team. <span className="text-primary">Secure</span> & <span className="text-primary">Open Source</span>.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default PremiumFooter;