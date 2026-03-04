import { motion } from "framer-motion";
import { Check, Minus, Zap } from "lucide-react";

const features = [
  { label: "Batch Closing", arsweep: true, manualCli: false, genericTools: true },
  { label: "Beginner Friendly UI", arsweep: true, manualCli: false, genericTools: false },
  { label: "Devnet Testing", arsweep: true, manualCli: true, genericTools: false },
  { label: "On-chain Transparency", arsweep: true, manualCli: true, genericTools: false },
  { label: "Open Source", arsweep: true, manualCli: true, genericTools: false },
  { label: "Transaction Preview", arsweep: true, manualCli: false, genericTools: true },
];

const Cell = ({ value }: { value: boolean }) =>
  value ? (
    <Check className="w-5 h-5 text-primary mx-auto" />
  ) : (
    <Minus className="w-5 h-5 text-muted-foreground/30 mx-auto" />
  );

const ComparisonTable = () => (
  <motion.section
    initial={{ opacity: 0, y: 40 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, amount: 0.1 }}
    transition={{ duration: 0.6, ease: "easeOut" }}
    className="py-24 px-4 relative"
  >
    <div className="container mx-auto max-w-4xl">
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold uppercase tracking-widest mb-4">
          <Zap className="w-3 h-3" /> Comparison
        </div>
        <h2 className="text-3xl sm:text-4xl font-extrabold mb-4 text-foreground">
          Why Choose{" "}
          <span className="gradient-text" translate="no">Arsweep</span>
        </h2>
        <p className="text-muted-foreground max-w-md mx-auto">
          The easiest way to reclaim locked SOL — no CLI knowledge required.
        </p>
      </div>

      <div className="glass rounded-2xl overflow-hidden border border-border/50">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[500px]">
            <thead>
              <tr className="border-b border-border bg-muted/20">
                <th className="text-left py-4 px-6 text-sm font-semibold text-muted-foreground w-1/2">Feature</th>
                <th className="py-4 px-6 text-center">
                  <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl gradient-bg text-primary-foreground text-sm font-bold shadow-lg">
                    <Zap className="w-3.5 h-3.5" />
                    <span translate="no">Arsweep</span>
                  </span>
                </th>
                <th className="py-4 px-6 text-center text-sm font-semibold text-muted-foreground">Manual CLI</th>
                <th className="py-4 px-6 text-center text-sm font-semibold text-muted-foreground">Generic Tools</th>
              </tr>
            </thead>
            <tbody>
              {features.map((row, i) => (
                <motion.tr
                  key={row.label}
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.07 }}
                  className={`border-b border-border/50 last:border-0 transition-colors hover:bg-muted/10 ${i % 2 === 1 ? "bg-muted/10" : ""}`}
                >
                  <td className="py-4 px-6 text-sm font-medium text-foreground">{row.label}</td>
                  <td className="py-4 px-6 bg-primary/5">
                    <Cell value={row.arsweep} />
                  </td>
                  <td className="py-4 px-6">
                    <Cell value={row.manualCli} />
                  </td>
                  <td className="py-4 px-6">
                    <Cell value={row.genericTools} />
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Bottom note */}
      <p className="text-center text-xs text-muted-foreground mt-4">
        ✦ <span translate="no">Arsweep</span> is the only tool built specifically for Solana dust sweeping — non-custodial & open source.
      </p>
    </div>
  </motion.section>
);

export default ComparisonTable;
