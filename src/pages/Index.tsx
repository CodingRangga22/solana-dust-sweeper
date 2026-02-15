import { useState, useCallback } from "react";
import { toast } from "sonner";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import StatsBar from "@/components/StatsBar";
import TokenList, { MOCK_TOKENS } from "@/components/TokenList";
import ActionBar from "@/components/ActionBar";

const Index = () => {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const handleToggle = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const handleSelectAll = useCallback(() => {
    setSelectedIds((prev) =>
      prev.size === MOCK_TOKENS.length ? new Set() : new Set(MOCK_TOKENS.map((t) => t.id))
    );
  }, []);

  const totalSol = selectedIds.size * 0.00204;

  const handleSweep = () => {
    toast.success(`🎉 Successfully swept ${selectedIds.size} accounts and reclaimed ${totalSol.toFixed(5)} SOL!`, {
      duration: 4000,
    });
    setSelectedIds(new Set());
  };

  return (
    <div className="relative min-h-screen bg-background overflow-hidden">
      {/* Ambient orbs */}
      <div className="orb w-[600px] h-[600px] bg-primary/10 top-1/3 -right-60 animate-float" />
      <div className="orb w-[500px] h-[500px] bg-secondary/10 bottom-0 -left-40 animate-float" style={{ animationDelay: "3s" }} />

      <Header />
      <Hero />
      <StatsBar />
      <TokenList selectedIds={selectedIds} onToggle={handleToggle} onSelectAll={handleSelectAll} />
      <ActionBar count={selectedIds.size} totalSol={totalSol} onSweep={handleSweep} />
    </div>
  );
};

export default Index;
