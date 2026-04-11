import { ExternalLink, LogOut } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "sonner";

interface ChangeWalletInstructionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDisconnect: () => void | Promise<void>;
}

const STEPS = [
  "Open Phantom extension",
  "Click your profile avatar (top right)",
  "Select a different account",
  "Return here and use Connect Solana wallet in the header (Privy)",
];

const ChangeWalletInstructionModal = ({
  open,
  onOpenChange,
  onDisconnect,
}: ChangeWalletInstructionModalProps) => {
  const handleOpenPhantom = () => {
    onOpenChange(false);
    toast.info("Open Phantom from your browser toolbar to switch accounts.");
  };

  const handleDisconnect = async () => {
    await onDisconnect();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="glass border-border sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold text-foreground">
            Switch account in Phantom
          </DialogTitle>
          <DialogDescription className="text-left text-muted-foreground">
            To use a different Phantom account, switch inside Phantom first, then reconnect here.
          </DialogDescription>
        </DialogHeader>
        <ol className="list-decimal list-inside space-y-2 text-sm text-foreground/90 mb-6 pl-1">
          {STEPS.map((step, i) => (
            <li key={i} className="leading-relaxed">
              {step}
            </li>
          ))}
        </ol>
        <DialogFooter className="flex flex-col sm:flex-row gap-2">
          <button
            type="button"
            onClick={handleOpenPhantom}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-primary/40 bg-primary/10 px-4 py-2.5 text-sm font-medium text-primary hover:bg-primary/20 transition-colors"
          >
            <ExternalLink className="w-4 h-4" />
            Open Phantom
          </button>
          <button
            type="button"
            onClick={handleDisconnect}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-muted/50 px-4 py-2.5 text-sm font-medium text-foreground hover:bg-muted transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Disconnect
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ChangeWalletInstructionModal;
