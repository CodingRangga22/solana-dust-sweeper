import { createContext, useContext, useState, useCallback, type ReactNode } from "react";

function initialNetworkBannerHiddenForRoute(): boolean {
  if (typeof window === "undefined") return false;
  const path = window.location.pathname.replace(/\/$/, "") || "/";
  return path === "/app" || path === "/agent";
}

const BannerContext = createContext<{
  bannerHeight: number;
  setBannerDismissed: (dismissed: boolean) => void;
  setNetworkBannerHiddenForRoute: (hidden: boolean) => void;
}>({
  bannerHeight: 0,
  setBannerDismissed: () => {},
  setNetworkBannerHiddenForRoute: () => {},
});

export const useBanner = () => useContext(BannerContext);

export const BannerProvider = ({
  children,
  initialHeight,
}: {
  children: ReactNode;
  initialHeight: number;
}) => {
  const [dismissed, setDismissed] = useState(false);
  const [hiddenForRoute, setHiddenForRoute] = useState(initialNetworkBannerHiddenForRoute);
  const bannerHeight = dismissed || hiddenForRoute ? 0 : initialHeight;

  const setBannerDismissed = useCallback((d: boolean) => setDismissed(d), []);
  const setNetworkBannerHiddenForRoute = useCallback((hidden: boolean) => setHiddenForRoute(hidden), []);

  return (
    <BannerContext.Provider
      value={{ bannerHeight, setBannerDismissed, setNetworkBannerHiddenForRoute }}
    >
      {children}
    </BannerContext.Provider>
  );
};
