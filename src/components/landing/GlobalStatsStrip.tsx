import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { motion } from "framer-motion";
import { Wallet, Zap, Users } from "lucide-react";

interface GlobalStats {
  totalSolReclaimed: number;
  totalAccountsSwept: number;
  totalWallets: number;
}

const GlobalStatsStrip = () => {
  const [stats, setStats] = useState<GlobalStats>({
    totalSolReclaimed: 0,
    totalAccountsSwept: 0,
    totalWallets: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data } = await supabase
          .from("sweep_stats")
          .select("total_accounts_swept, total_sol_reclaimed, wallet_address");

        if (data && data.length > 0) {
          const totalSol = data.reduce((sum, r) => sum + Number(r.total_sol_reclaimed), 0);
          const totalAccounts = data.reduce((sum, r) => sum + Number(r.total_accounts_swept), 0);
          setStats({
            totalSolReclaimed: totalSol,
            totalAccountsSwept: totalAccounts,
            totalWallets: data.length,
          });
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const items = [
    {
      icon: Zap,
      label: "SOL Reclaimed",
      value: loading ? "..." : `${stats.totalSolReclaimed.toFixed(4)} SOL`,
    },
    {
      icon: Wallet,
      label: "Accounts Closed",
      value: loading ? "..." : stats.totalAccountsSwept.toLocaleString(),
    },
    {
      icon: Users,
      label: "Wallets Cleaned",
      value: loading ? "..." : stats.totalWallets.toLocaleString(),
    },
  ];

  return (
    <section className="py-12 px-4">
      <div className="container mx-auto max-w-4xl">
        <p className="text-center text-xs text-muted-foreground uppercase tracking-widest mb-6 font-semibold">
          📊 Live Stats — Updated in real-time
        </p>
        <div className="grid grid-cols-3 gap-4">
          {items.map((item, i) => (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="glass rounded-2xl p-6 text-center border border-primary/10 hover:border-primary/30 transition-colors"
            >
              <item.icon className="w-6 h-6 text-primary mx-auto mb-3" />
              <p className="text-2xl font-extrabold gradient-text mb-1">{item.value}</p>
              <p className="text-xs text-muted-foreground">{item.label}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default GlobalStatsStrip;
