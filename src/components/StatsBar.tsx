import { useState } from "react";
import { motion } from "framer-motion";
import { Coins, RefreshCw, Layers, Info } from "lucide-react";
import AnimatedCounter from "./AnimatedCounter";

interface StatsBarProps {
  totalDust: number;
  accountsToClose: number;
  grossRefund: number;
  serviceFee: number;
  gasFee: number;
  netRefund: number;
}

const StatsBar = ({
  totalDust,
  accountsToClose,
  grossRefund,
  serviceFee,
  gasFee,
  netRefund,
}: StatsBarProps) => {
  const [hoveredTooltip, setHoveredTooltip] = useState(false);

  const stats = [
    { label: "Total Dust Found", value: String(totalDust), icon: Coins, color: "text-primary", hasTooltip: false },
    { label: "Net Refund", value: accountsToClose > 0 ? `${Math.max(netRefund, 0).toFixed(5)} SOL` : "0.00000 SOL", icon: RefreshCw, color: "text-secondary", hasTooltip: true },
    { label: "Accounts to Close", value: String(accountsToClose), icon: Layers, color: "text-primary", hasTooltip: false },
  ];

  return (
    <section className="px-4 pb-8">
      <div className="container mx-auto grid grid-cols-3 gap-3 sm:gap-4 max-w-3xl">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 + i * 0.1, duration: 0.5 }}
            className="surface-premium rounded-2xl px-4 py-4 sm:px-5 text-center ring-1 ring-border transition-[box-shadow,background] duration-300 hover:ring-ring/20 hover:shadow-glow"
          >
            <stat.icon className="mx-auto mb-2 h-[18px] w-[18px] text-muted-foreground" />
            <AnimatedCounter
              value={stat.value}
              style={{
                fontSize: "clamp(16px,2.5vw,22px)",
                fontWeight: 700,
                color: "hsl(var(--foreground))",
                letterSpacing: "-0.01em",
                fontFamily: "var(--font-mono)",
              }}
            />
            <div className="flex items-center justify-center gap-1 mt-1">
              <p
                style={{
                  fontSize: 11,
                  color: "hsl(var(--muted-foreground))",
                  fontFamily: "var(--font-mono)",
                  letterSpacing: "0.04em",
                  marginTop: 4,
                }}
              >
                {stat.label}
              </p>
              {stat.hasTooltip && (
                <div className="relative">
                  <Info
                    className="w-3.5 h-3.5 text-muted-foreground hover:text-primary cursor-help transition-colors"
                    onMouseEnter={() => setHoveredTooltip(true)}
                    onMouseLeave={() => setHoveredTooltip(false)}
                  />
                  {hoveredTooltip && (
                    <motion.div
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="absolute bottom-full right-0 mb-2 w-64 glass rounded-xl p-3 text-xs text-muted-foreground shadow-xl z-50 border border-border"
                    >
                      <p className="font-semibold text-foreground mb-2">Fee Breakdown</p>
                      <div className="space-y-1.5">
                        <div className="flex justify-between gap-4">
                          <span>Gross (est.)</span>
                          <span className="text-foreground">{grossRefund.toFixed(5)} SOL</span>
                        </div>
                        <div className="flex justify-between gap-4 text-red-400">
                          <span>− Network Gas (est.)</span>
                          <span>~{gasFee.toFixed(5)} SOL</span>
                        </div>
                        <div className="flex justify-between gap-4 text-red-400">
                          <span>− Service (1.5% of rent)</span>
                          <span>{serviceFee.toFixed(5)} SOL</span>
                        </div>
                        <div className="border-t border-border pt-1.5 flex justify-between gap-4 font-semibold text-emerald-400">
                          <span>You Receive (est.)</span>
                          <span>{Math.max(netRefund, 0).toFixed(5)} SOL</span>
                        </div>
                      </div>
                      <div className="absolute top-full right-4 w-2 h-2 rotate-45 glass border-b border-r border-border -mt-1" />
                    </motion.div>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

export default StatsBar;