import { motion, AnimatePresence } from "framer-motion";
import { Trash2 } from "lucide-react";

interface ActionBarProps {
  count: number;
  totalSol: number;
  onSweep: () => void;
}

const ActionBar = ({ count, totalSol, onSweep }: ActionBarProps) => (
  <AnimatePresence>
    {count > 0 && (
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-2rem)] max-w-xl"
      >
        <div className="glass rounded-2xl p-4 flex items-center justify-between gap-4 shadow-2xl border border-border">
          <p className="text-sm text-foreground">
            Sweep <span className="font-bold text-primary">{count}</span> items and reclaim{" "}
            <span className="font-bold text-primary">{totalSol.toFixed(5)} SOL</span>
          </p>
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.95 }}
            onClick={onSweep}
            className="gradient-bg gradient-bg-hover flex items-center gap-2 px-5 py-2.5 rounded-xl text-primary-foreground font-semibold text-sm whitespace-nowrap transition-all duration-200"
          >
            <Trash2 className="w-4 h-4" />
            Confirm Sweep
          </motion.button>
        </div>
      </motion.div>
    )}
  </AnimatePresence>
);

export default ActionBar;
