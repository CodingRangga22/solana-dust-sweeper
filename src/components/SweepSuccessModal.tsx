import { useEffect } from "react";
import { motion } from "framer-motion";
import { CheckCircle2, Share2, ExternalLink } from "lucide-react";
import confetti from "canvas-confetti";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { isDevnet } from "@/config/env";

const EXPLORER_BASE = "https://solscan.io/tx";



const sendDiscordSweepReport = async (
  walletAddress: string,
  count: number,
  totalSol: number,
  signature: string
) => {
  const webhookUrl = import.meta.env.VITE_DISCORD_SWEEP_WEBHOOK;
  if (!webhookUrl) return;

  const solscanUrl = `https://solscan.io/tx/${signature}`;
  const solscanWalletUrl = `https://solscan.io/account/${walletAddress}`;
  const usdValue = (totalSol * 130).toFixed(2); // approximate SOL price

  const embed = {
    title: "🧹 New Sweep Completed!",
    color: 0x1D9E75,
    fields: [
      {
        name: "👛 Wallet",
        value: `[${walletAddress.slice(0,4)}...${walletAddress.slice(-4)}](${solscanWalletUrl})`,
        inline: true,
      },
      {
        name: "📦 Accounts Closed",
        value: `${count} accounts`,
        inline: true,
      },
      {
        name: "💰 SOL Reclaimed",
        value: `${totalSol.toFixed(5)} SOL (~$${usdValue})`,
        inline: true,
      },
      {
        name: "🔗 Transaction",
        value: `[View on Solscan](${solscanUrl})`,
        inline: false,
      },
    ],
    footer: {
      text: "Arsweep — Solana Wallet Cleaner • arsweep.fun",
    },
    timestamp: new Date().toISOString(),
  };

  try {
    await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ embeds: [embed] }),
    });
  } catch (e) {
    console.error("Discord webhook error:", e);
  }
};

interface SweepSuccessModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  count: number;
  totalSol: number;
  signature?: string;
  walletAddress?: string;
}

const SweepSuccessModal = ({ open, onOpenChange, count, totalSol, signature, walletAddress }: SweepSuccessModalProps) => {
  useEffect(() => {
    if (open && signature && walletAddress) {
      sendDiscordSweepReport(walletAddress, count, totalSol, signature);
    }
  }, [open, signature, walletAddress]);

  useEffect(() => {
    if (open) {
      const end = Date.now() + 800;
      const frame = () => {
        confetti({ particleCount: 3, angle: 60, spread: 55, origin: { x: 0 }, colors: ["#14F195", "#9945FF", "#ffffff"] });
        confetti({ particleCount: 3, angle: 120, spread: 55, origin: { x: 1 }, colors: ["#14F195", "#9945FF", "#ffffff"] });
        if (Date.now() < end) requestAnimationFrame(frame);
      };
      frame();
    }
  }, [open]);

  const shareText = encodeURIComponent(
    `🧹 Just reclaimed ${totalSol.toFixed(4)} SOL from ${count} ghost accounts in my Solana wallet — rent I did not even know was locked!\n\nTook 5 seconds. No seed phrase needed.\n\nIf you have ever used Solana, you probably have hidden SOL too 👇\n\narsweep.fun\n\n#Solana #Web3 @Arsweep_AI`
  );
  const shareUrl = `https://x.com/intent/tweet?text=${shareText}`;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="glass border-border sm:max-w-md text-center">
        <DialogHeader className="items-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 15 }}
          >
            <div className="w-16 h-16 rounded-full gradient-bg flex items-center justify-center mx-auto mb-3">
              <CheckCircle2 className="w-8 h-8 text-primary-foreground" />
            </div>
          </motion.div>
          <DialogTitle className="text-xl font-bold text-foreground">Sweep Successful! 🎉</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            You successfully closed{" "}
            <span className="font-semibold text-primary">{count} accounts</span> and reclaimed{" "}
            <span className="font-semibold text-primary">{totalSol.toFixed(5)} SOL</span>.
          </DialogDescription>
        </DialogHeader>
        {signature && (
          <a
            href={`${EXPLORER_BASE}/${signature}${isDevnet ? "?cluster=devnet" : ""}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl glass glass-hover text-foreground text-sm font-medium transition-colors mb-2"
          >
            <ExternalLink className="w-4 h-4" />
            View Transaction on Solscan
          </a>
        )}
        <a
          href={shareUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="gradient-bg gradient-bg-hover flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-primary-foreground font-semibold text-sm transition-all duration-200 mt-2"
        >
          <Share2 className="w-4 h-4" />
          Share on X
        </a>
      </DialogContent>
    </Dialog>
  );
};

export default SweepSuccessModal;
