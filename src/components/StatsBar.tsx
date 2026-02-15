import { useState } from "react";
import { motion } from "framer-motion";
import { Coins, RefreshCw, Layers, Info } from "lucide-react";
import AnimatedCounter from "./AnimatedCounter";

interface StatsBarProps {
  totalDust: number;
  potentialRefund: number;
  accountsToClose: number;
}

const StatsBar = ({ totalDust, potentialRefund, accountsToClose }: StatsBarProps) => {
  const [hoveredTooltip, setHoveredTooltip] = useState(false);

  const stats = [
    { label: "Total Dust Found", value: String(totalDust), icon: Coins, color: "text-primary", hasTooltip: false },
    { label: "Potential Refund", value: `${potentialRefund.toFixed(5)} SOL`, icon: RefreshCw, color: "text-secondary", hasTooltip: true },
    { label: "Accounts to Close", value: String(accountsToClose), icon: Layers, color: "text-primary", hasTooltip: false },
  ];

  return (
    <section className="px-4 pb-8">
      <div className="container mx-auto grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 + i * 0.1, duration: 0.5 }}
            className="glass rounded-2xl p-5 text-center group hover:shadow-[0_0_30px_hsla(162,93%,51%,0.15),0_0_60px_hsla(271,100%,63%,0.1)] transition-shadow duration-300 gradient-border relative"
          >
            <stat.icon className={`w-5 h-5 mx-auto mb-2 ${stat.color}`} />
            <AnimatedCounter value={stat.value} className="text-2xl font-bold text-foreground" />
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
                      className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-56 glass rounded-xl p-3 text-xs text-muted-foreground shadow-xl z-50 border border-border"
                    >
                      <p className="font-semibold text-foreground mb-1">Fee Breakdown</p>
                      <p>Gross Refund: 0.002042 SOL/account</p>
                      <p>− Network Gas Fee</p>
                      <p>− 1.5% Arsweep Service Fee</p>
                      <div className="absolute top-full left-1/2 -translate-x-1/2 w-2 h-2 rotate-45 glass border-b border-r border-border -mt-1" />
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
