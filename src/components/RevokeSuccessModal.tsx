import { useEffect } from "react";
import { motion } from "framer-motion";
import { CheckCircle2, ExternalLink, Share2, Copy } from "lucide-react";
import confetti from "canvas-confetti";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { EXPLORER_TX_URL } from "@/config/env";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  walletAddress: string;
  approvalsRevoked: number;
  signature: string;
};

export default function RevokeSuccessModal({ open, onOpenChange, walletAddress, approvalsRevoked, signature }: Props) {
  useEffect(() => {
    if (!open) return;
    const end = Date.now() + 650;
    const frame = () => {
      confetti({ particleCount: 3, angle: 60, spread: 55, origin: { x: 0 }, colors: ["#14F195", "#9945FF", "#ffffff"] });
      confetti({ particleCount: 3, angle: 120, spread: 55, origin: { x: 1 }, colors: ["#14F195", "#9945FF", "#ffffff"] });
      if (Date.now() < end) requestAnimationFrame(frame);
    };
    frame();
  }, [open]);

  const shareText = encodeURIComponent(
    `🔐 Just revoked ${approvalsRevoked} delegate approvals on Solana with Arsweep.\n\nLock down your wallet: arsweep.fun/revoke\n\n#Solana #WalletSecurity @Arsweep_AI`
  );
  const shareUrl = `https://x.com/intent/tweet?text=${shareText}`;
  const tgText = encodeURIComponent(`🔐 Revoked ${approvalsRevoked} delegate approvals.\n\nTry it: arsweep.fun/revoke`);
  const tgUrl = `https://t.me/share/url?url=${encodeURIComponent("https://arsweep.fun/revoke")}&text=${tgText}`;

  const receiptText =
    `Arsweep revoke receipt\n` +
    `- Wallet: ${walletAddress}\n` +
    `- Approvals revoked: ${approvalsRevoked}\n` +
    `- Tx: ${EXPLORER_TX_URL(signature)}\n`;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="glass border-border sm:max-w-md text-center">
        <DialogHeader className="items-center">
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 200, damping: 15 }}>
            <div className="w-16 h-16 rounded-full gradient-bg flex items-center justify-center mx-auto mb-3">
              <CheckCircle2 className="w-8 h-8 text-primary-foreground" />
            </div>
          </motion.div>
          <DialogTitle className="text-xl font-bold text-foreground">Revoke Successful</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Revoked <span className="font-semibold text-primary">{approvalsRevoked}</span> delegate approval{approvalsRevoked === 1 ? "" : "s"}.
          </DialogDescription>
        </DialogHeader>

        <a
          href={EXPLORER_TX_URL(signature)}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl glass glass-hover text-foreground text-sm font-medium transition-colors mb-2"
        >
          <ExternalLink className="w-4 h-4" />
          View Transaction
        </a>

        <a
          href={shareUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="gradient-bg gradient-bg-hover flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-primary-foreground font-semibold text-sm transition-all duration-200 mt-2"
        >
          <Share2 className="w-4 h-4" />
          Share on X
        </a>
        <a
          href={tgUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl glass glass-hover text-foreground text-sm font-semibold transition-colors mt-2"
        >
          <Share2 className="w-4 h-4" />
          Share on Telegram
        </a>
        <button
          type="button"
          onClick={async () => {
            try {
              await navigator.clipboard.writeText(receiptText);
            } catch (e) {
              console.error("Failed to copy revoke receipt:", e);
            }
          }}
          className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl glass glass-hover text-foreground text-sm font-semibold transition-colors mt-2"
        >
          <Copy className="w-4 h-4" />
          Copy receipt
        </button>
      </DialogContent>
    </Dialog>
  );
}

