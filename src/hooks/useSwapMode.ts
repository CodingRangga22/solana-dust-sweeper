import { useState, useCallback } from "react";

export type TokenMode = "close" | "swap";

export function useSwapMode() {
  const [tokenModes, setTokenModes] = useState<Record<string, TokenMode>>({});

  const getMode = useCallback(
    (id: string): TokenMode => tokenModes[id] ?? "close",
    [tokenModes],
  );

  const setMode = useCallback((id: string, mode: TokenMode) => {
    setTokenModes((prev) => ({ ...prev, [id]: mode }));
  }, []);

  const toggleMode = useCallback((id: string) => {
    setTokenModes((prev) => ({
      ...prev,
      [id]: (prev[id] ?? "close") === "close" ? "swap" : "close",
    }));
  }, []);

  const resetModes = useCallback(() => setTokenModes({}), []);

  return { tokenModes, getMode, setMode, toggleMode, resetModes };
}
