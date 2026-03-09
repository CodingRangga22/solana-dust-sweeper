import { useState } from "react";
import { motion } from "framer-motion";
import { Coins, RefreshCw, Layers, Info } from "lucide-react";
import AnimatedCounter from "./AnimatedCounter";

const SERVICE_FEE = 0.015;
const GAS_FEE_PER = 0.000005;

interface StatsBarProps {
  totalDust: number;
  potentialRefund: number;
  accountsToClose: number;
}

const StatsBar = ({ totalDust, potentialRefund, accountsToClose }: StatsBarProps) => {
  const [hoveredTooltip, setHoveredTooltip] = useState(false);

  const serviceFee = potentialRefund * SERVICE_FEE;
  const gasFee = accountsToClose * GAS_FEE_PER;
  const netRefund = Math.max(potentialRefund - serviceFee - gasFee, 0);

  const stats = [
    { label: "Total Dust Found", value: String(totalDust), icon: Coins, color: "text-primary", hasTooltip: false },
    { label: "Net Refund", value: accountsToClose > 0 ? `${netRefund.toFixed(5)} SOL` : "0.00000 SOL", icon: RefreshCw, color: "text-secondary", hasTooltip: true },
    { label: "Accounts to Close", value: String(accountsToClose), icon: Layers, color: "text-primary", hasTooltip: false },
  ];

  return (
    <section className="px-4 pb-8">
      <div className="container mx-auto grid grid-cols-3 gap-2 sm:gap-4 max-w-3xl">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 + i * 0.1, duration: 0.5 }}
            className="glass rounded-2xl p-3 sm:p-5 text-center group hover:shadow-[0_0_30px_hsla(162,93%,51%,0.15),0_0_60px_hsla(271,100%,63%,0.1)] transition-shadow duration-300 gradient-border relative"
          >
            <stat.icon className={`w-5 h-5 mx-auto mb-2 ${stat.color}`} />
            <AnimatedCounter value={stat.value} className="text-sm sm:text-2xl font-bold text-foreground break-all" />
            <div className="flex items-center justify-center gap-1 mt-1">
              <p className="text-xs text-muted-foreground">{stat.label}</p>
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
                          <span>Gross Refund</span>
                          <span className="text-foreground">{potentialRefund.toFixed(5)} SOL</span>
                        </div>
                        <div className="flex justify-between gap-4 text-red-400">
                          <span>− Network Gas</span>
                          <span>~{gasFee.toFixed(5)} SOL</span>
                        </div>
                        <div className="flex justify-between gap-4 text-red-400">
                          <span>− Service Fee (1.5%)</span>
                          <span>{serviceFee.toFixed(5)} SOL</span>
                        </div>
                        <div className="border-t border-border pt-1.5 flex justify-between gap-4 font-semibold text-emerald-400">
                          <span>You Receive</span>
                          <span>{netRefund.toFixed(5)} SOL</span>
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