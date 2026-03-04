import { useState, useRef } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";
import { Github, ExternalLink } from "lucide-react";
import { useNavigate } from "react-router-dom";
import ArsweepLogo from "./ArsweepLogo";
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
const DiscordIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
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
      style={{ x: springX, y: springY }}
      whileTap={{ scale: 0.9 }}
      className="glass w-11 h-11 rounded-xl flex items-center justify-center text-muted-foreground transition-all duration-300 hover:text-primary hover:shadow-[0_0_20px_hsla(162,93%,51%,0.25)] hover:border-primary/30"
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
    <footer className="relative group/footer opacity-70 hover:opacity-100 transition-opacity duration-500">
      {/* Gradient top border with glow */}
      <div className="h-px w-full bg-gradient-to-r from-transparent via-primary to-secondary" />
      <div className="h-8 w-full bg-gradient-to-b from-primary/5 to-transparent" />

      <div className="relative glass border-t-0 py-16 px-4">
        {/* Faint noise texture overlay */}
        <div className="absolute inset-0 opacity-[0.02]" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.5'/%3E%3C/svg%3E\")" }} />

        <div className="container mx-auto max-w-6xl relative z-10">
          {/* 4-Column Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-8 mb-12">
            {/* Col 1: Brand & Newsletter */}
            <div className="space-y-5">
              <div className="flex items-center gap-3" translate="no">
                <motion.div
                  animate={{
                    filter: [
                      "brightness(1) drop-shadow(0 0 0px transparent)",
                      "brightness(1.3) drop-shadow(0 0 12px hsla(162,93%,51%,0.4))",
                      "brightness(1) drop-shadow(0 0 0px transparent)",
                    ],
                  }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                >
                  <ArsweepLogo className="w-8 h-8" />
                </motion.div>
                <span className="text-lg font-bold gradient-text" translate="no"><span translate="no"><span translate="no" className="notranslate">Arsweep</span></span></span>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                The most trusted Solana wallet cleaner. Reclaim hidden SOL from dust accounts.
              </p>
              <form onSubmit={handleSubscribe} className="space-y-2">
                <p className="text-xs font-semibold text-foreground uppercase tracking-wider">Join Newsletter</p>
                <div className="flex gap-2">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    className="flex-1 bg-muted/30 border border-border rounded-xl px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-primary/50 transition-colors"
                    required
                  />
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    type="submit"
                    className="gradient-bg gradient-bg-hover px-4 py-2 rounded-xl text-primary-foreground text-xs font-semibold whitespace-nowrap"
                  >
                    {subscribed ? "✓" : "Subscribe"}
                  </motion.button>
                </div>
              </form>
            </div>

            {/* Col 2: Product */}
            <div className="space-y-4">
              <p className="text-xs font-semibold text-foreground uppercase tracking-wider">Product</p>
              <ul className="space-y-2.5">
                {[
                  { label: "Dashboard", onClick: () => navigate("/app") },
                  { label: "Simulation", onClick: () => navigate("/app") },
                  { label: "Direct Sweep", onClick: () => navigate("/app") },
                  { label: "Documentation", onClick: () => navigate("/docs") },
                ].map((item) => (
                  <li key={item.label}>
                    {"href" in item ? (
                      <a href={item.href} className="text-sm text-muted-foreground hover:text-primary transition-colors duration-200 flex items-center gap-1.5 group">
                        {item.label}
                        <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </a>
                    ) : (
                      <button onClick={item.onClick} className="text-sm text-muted-foreground hover:text-primary transition-colors duration-200">
                        {item.label}
                      </button>
                    )}
                  </li>
                ))}
              </ul>
            </div>

            {/* Col 3: Legal & Ecosystem */}
            <div className="space-y-4">
              <p className="text-xs font-semibold text-foreground uppercase tracking-wider">Legal & Resources</p>
              <ul className="space-y-2.5">
                {[
                  { label: "Privacy Policy", href: "#" },
                  { label: "Terms of Service", href: "#" },
                  { label: "Contact", href: "mailto:contact@arsweep.io" },
                  { label: "GitHub (Open Source)", href: "https://github.com", icon: Github },
                  { label: "Solana Explorer", href: isDevnet ? "https://explorer.solana.com/?cluster=devnet" : "https://explorer.solana.com" },
                ].map((item) => (
                  <li key={item.label}>
                    <a
                      href={item.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-muted-foreground hover:text-primary transition-colors duration-200 flex items-center gap-1.5 group"
                    >
                      {item.icon && <item.icon className="w-3.5 h-3.5" />}
                      {item.label}
                      <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Col 4: Community & Status */}
            <div className="space-y-5">
              <div className="space-y-4">
                <p className="text-xs font-semibold text-foreground uppercase tracking-wider">Community</p>
                <div className="flex items-center gap-3" translate="no">
                  <MagneticIcon href="https://x.com/Arsweep_AI" label="X (Twitter)"><TwitterIcon /></MagneticIcon>
                  <MagneticIcon href="#" label="Discord"><DiscordIcon /></MagneticIcon>
                  <MagneticIcon href="#" label="Instagram"><InstagramIcon /></MagneticIcon>
                  <MagneticIcon href="#" label="YouTube"><YoutubeIcon /></MagneticIcon>
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
            <p className="text-xs text-muted-foreground">
              © 2024 Arsweep. All rights reserved.
            </p>
            <p className="text-xs text-muted-foreground">
              Built with ❤️ by Arsweep Team. <span className="text-primary">Secure</span> & <span className="text-primary">Open Source</span>.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default PremiumFooter;