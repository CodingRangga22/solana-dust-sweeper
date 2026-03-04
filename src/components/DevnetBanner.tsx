import { AlertTriangle, X, ExternalLink } from "lucide-react";
import { isDevnet } from "@/config/env";
import { FAUCET_URL } from "@/config/env";
import { useBanner } from "./BannerProvider";

const DevnetBanner = () => {
  const { setBannerDismissed } = useBanner();

  if (!isDevnet) return null;

  return <DevnetBannerContent onDismiss={() => setBannerDismissed(true)} />;
};

const DevnetBannerContent = ({ onDismiss }: { onDismiss: () => void }) => {

  return (
    <div
      className="fixed top-0 left-0 right-0 z-[60] flex flex-wrap items-center justify-center gap-2 px-4 py-2 bg-amber-500/10 border-b border-amber-500/20 backdrop-blur-sm"
      role="alert"
      aria-live="polite"
    >
      <div className="flex items-center gap-2 text-amber-400/90">
        <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
        <span className="text-xs sm:text-sm font-medium text-foreground/95">
          Running on Solana Devnet — No real funds involved.
        </span>
      </div>
      <div className="flex items-center gap-2">
        <a
          href={FAUCET_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/30 text-amber-200 text-xs sm:text-sm font-semibold transition-colors"
        >
          Get Devnet SOL
          <ExternalLink className="w-3 h-3" />
        </a>
        <a
          href="#faq"
          className="text-xs sm:text-sm font-medium text-amber-200/90 hover:text-amber-100 underline underline-offset-2 transition-colors"
        >
          Learn more
        </a>
      </div>
      <button
        onClick={onDismiss}
        className="absolute right-3 p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-white/5 transition-colors"
        aria-label="Dismiss banner"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};

export default DevnetBanner;
