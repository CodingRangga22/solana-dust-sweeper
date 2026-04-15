import Marquee from "@/components/landing/Marquee";
import { INTEGRATION_MARQUEE_ITEMS } from "@/config/integrations";

export default function BottomMarqueeDock() {
  return (
    <Marquee
      dock
      items={INTEGRATION_MARQUEE_ITEMS}
      speedSeconds={20}
    />
  );
}

