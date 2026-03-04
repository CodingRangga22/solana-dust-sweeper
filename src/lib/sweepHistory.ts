import { format } from "date-fns";

export interface SweepRecord {
  id: string;
  walletAddress: string;
  timestamp: number;
  accountsClosed: number;
  totalSolReclaimed: number;
  signature?: string;
  network: "mainnet" | "devnet";
}

const STORAGE_KEY = "arsweep_history";
const MAX_RECORDS = 50;

export function getSweepHistory(walletAddress: string): SweepRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const all: SweepRecord[] = JSON.parse(raw);
    return all
      .filter((r) => r.walletAddress === walletAddress)
      .sort((a, b) => b.timestamp - a.timestamp);
  } catch {
    return [];
  }
}

export function saveSweepRecord(record: Omit<SweepRecord, "id">): SweepRecord {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const all: SweepRecord[] = raw ? JSON.parse(raw) : [];

    const newRecord: SweepRecord = {
      ...record,
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    };

    all.unshift(newRecord);

    const walletRecords = all.filter(
      (r) => r.walletAddress === record.walletAddress,
    );
    if (walletRecords.length > MAX_RECORDS) {
      const oldest = walletRecords[MAX_RECORDS - 1];
      const oldestIndex = all.findIndex((r) => r.id === oldest.id);
      if (oldestIndex !== -1) all.splice(oldestIndex, 1);
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
    return newRecord;
  } catch {
    return { ...record, id: Date.now().toString() };
  }
}

export function clearSweepHistory(walletAddress: string): void {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    const all: SweepRecord[] = JSON.parse(raw);
    const filtered = all.filter((r) => r.walletAddress !== walletAddress);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  } catch {
    // silently ignore storage errors
  }
}

export function formatSweepDate(timestamp: number): string {
  return format(new Date(timestamp), "dd MMM yyyy, HH:mm");
}

export function formatSweepDateShort(timestamp: number): string {
  return format(new Date(timestamp), "dd MMM yyyy");
}
