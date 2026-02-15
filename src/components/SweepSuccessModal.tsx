import { useEffect } from "react";
import { motion } from "framer-motion";
import { CheckCircle2, Share2 } from "lucide-react";
import confetti from "canvas-confetti";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

interface SweepSuccessModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  count: number;
  totalSol: number;
}

const SweepSuccessModal = ({ open, onOpenChange, count, totalSol }: SweepSuccessModalProps) => {
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
    `🧹 Just swept ${count} dust accounts and reclaimed ${totalSol.toFixed(5)} SOL with @Arsweep! Clean wallet, happy life. #Solana #Arsweep`
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
