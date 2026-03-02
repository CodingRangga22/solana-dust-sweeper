import { createContext, useContext, useState, useCallback, type ReactNode } from "react";

const BannerContext = createContext<{
  bannerHeight: number;
  setBannerDismissed: (dismissed: boolean) => void;
}>({
  bannerHeight: 0,
  setBannerDismissed: () => {},
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
  const bannerHeight = dismissed ? 0 : initialHeight;

  const setBannerDismissed = useCallback((d: boolean) => setDismissed(d), []);

  return (
    <BannerContext.Provider value={{ bannerHeight, setBannerDismissed }}>
      {children}
    </BannerContext.Provider>
  );
};
