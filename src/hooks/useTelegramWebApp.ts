import { useEffect, useState } from "react";

interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  photo_url?: string;
}

interface TelegramWebAppHook {
  isInTelegram: boolean;
  user: TelegramUser | null;
  walletFromTwa: string | null;
  actionFromTwa: string | null;
  ready: () => void;
  close: () => void;
  showAlert: (message: string) => void;
  showConfirm: (message: string, callback: (confirmed: boolean) => void) => void;
  sendDataToBot: (data: object) => void;
  expand: () => void;
  setMainButton: (text: string, onClick: () => void) => void;
  hideMainButton: () => void;
}

export function useTelegramWebApp(): TelegramWebAppHook {
  const [isInTelegram, setIsInTelegram] = useState(false);
  const [user, setUser] = useState<TelegramUser | null>(null);
  const [walletFromTwa, setWalletFromTwa] = useState<string | null>(null);
  const [actionFromTwa, setActionFromTwa] = useState<string | null>(null);

  useEffect(() => {
    const tg = (window as any).Telegram?.WebApp;
    if (!tg) return;

    // Only true if actually inside Telegram WebApp (has initData)
    const hasInitData = Boolean(tg.initData && tg.initData.length > 0);
    setIsInTelegram(hasInitData);
    tg.ready();
    tg.expand();

    // Set Telegram theme colors
    document.documentElement.style.setProperty(
      "--tg-theme-bg-color",
      tg.themeParams?.bg_color ?? "#0f0f0f"
    );

    // Get user info
    if (tg.initDataUnsafe?.user) {
      setUser(tg.initDataUnsafe.user);
    }

    // Get wallet & action from URL params (passed by bot)
    const params = new URLSearchParams(window.location.search);
    const wallet = params.get("wallet");
    const action = params.get("action");

    if (wallet) setWalletFromTwa(wallet);
    if (action) setActionFromTwa(action);
  }, []);

  const tg = () => (window as any).Telegram?.WebApp;

  return {
    isInTelegram,
    user,
    walletFromTwa,
    actionFromTwa,

    ready: () => tg()?.ready(),
    close: () => tg()?.close(),
    expand: () => tg()?.expand(),

    showAlert: (message: string) => {
      tg()?.showAlert(message);
    },

    showConfirm: (message: string, callback: (confirmed: boolean) => void) => {
      tg()?.showConfirm(message, callback);
    },

    // Send data back to bot after sweep
    sendDataToBot: (data: object) => {
      tg()?.sendData(JSON.stringify(data));
    },

    setMainButton: (text: string, onClick: () => void) => {
      const btn = tg()?.MainButton;
      if (!btn) return;
      btn.setText(text);
      btn.onClick(onClick);
      btn.show();
      btn.enable();
    },

    hideMainButton: () => {
      tg()?.MainButton?.hide();
    },
  };
}
