import { motion } from "framer-motion";
import { Check, Minus } from "lucide-react";

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
    <Minus className="w-5 h-5 text-muted-foreground/50 mx-auto" />
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
        <h2 className="text-3xl sm:text-4xl font-extrabold mb-4 text-foreground">
          Why Choose <span className="gradient-text" translate="no"><span translate="no"><span translate="no" className="notranslate">Arsweep</span></span></span>
        </h2>
        <p className="text-muted-foreground">
          Compare Arsweep with manual CLI and generic token tools.
        </p>
      </div>

      <div className="glass rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[500px]">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-4 px-6 text-sm font-semibold text-muted-foreground">Feature</th>
                <th className="py-4 px-6 text-center">
                  <span className="inline-block px-3 py-1 rounded-lg gradient-bg text-primary-foreground text-sm font-bold">
                    Arsweep
                  </span>
                </th>
                <th className="py-4 px-6 text-center text-sm font-semibold text-muted-foreground">Manual CLI</th>
                <th className="py-4 px-6 text-center text-sm font-semibold text-muted-foreground">Generic Tools</th>
              </tr>
            </thead>
            <tbody>
              {features.map((row, i) => (
                <tr
                  key={row.label}
                  className={`border-b border-border ${i % 2 === 1 ? "bg-muted/20" : ""}`}
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
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </motion.section>
);

export default ComparisonTable;