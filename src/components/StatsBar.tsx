import { motion } from "framer-motion";
import { Coins, RefreshCw, Layers } from "lucide-react";

const stats = [
  { label: "Total Dust Found", value: "24", icon: Coins, color: "text-primary" },
  { label: "Potential Refund", value: "0.0489 SOL", icon: RefreshCw, color: "text-secondary" },
  { label: "Accounts to Close", value: "24", icon: Layers, color: "text-primary" },
];

const StatsBar = () => (
  <section className="px-4 pb-8">
    <div className="container mx-auto grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl">
      {stats.map((stat, i) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 + i * 0.1, duration: 0.5 }}
          className="glass rounded-2xl p-5 text-center"
        >
          <stat.icon className={`w-5 h-5 mx-auto mb-2 ${stat.color}`} />
          <p className="text-2xl font-bold text-foreground">{stat.value}</p>
          <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
        </motion.div>
      ))}
    </div>
  </section>
);

export default StatsBar;
