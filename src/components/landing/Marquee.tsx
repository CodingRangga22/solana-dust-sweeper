import React from "react";

type MarqueeItem = {
  label: string;
  sublabel?: string;
};

export default function Marquee({
  title,
  items,
  speedSeconds = 22,
  dock = false,
}: {
  title?: string;
  items: MarqueeItem[];
  speedSeconds?: number;
  dock?: boolean;
}) {
  return (
    <section className={dock ? "ar-marquee-dock" : "relative z-[2]"}>
      <div className={dock ? "ar-marquee-dock__inner ar-container" : "ar-container"}>
        {title ? (
          <p className="ar-section-kicker mb-4 text-left">{title}</p>
        ) : null}
      </div>

      <div
        className={dock ? "ar-marquee ar-marquee--dock" : "ar-marquee"}
        style={{ ["--marquee-duration" as any]: `${speedSeconds}s` }}
        aria-label={title ?? "marquee"}
      >
        <div className="ar-marquee__track">
          {[0, 1].map((group) => (
            <div className="ar-marquee__group" key={group} aria-hidden={group === 1}>
              {items.map((it, idx) => (
                <div className="ar-marquee__item" key={`${it.label}-${group}-${idx}`}>
                  <span className="ar-marquee__pill" translate="no">
                    <span className="ar-marquee__dot" aria-hidden />
                    <span className="ar-marquee__label">{it.label}</span>
                    {it.sublabel ? <span className="ar-marquee__sub">{it.sublabel}</span> : null}
                  </span>
                </div>
              ))}
            </div>
          ))}
        </div>

        <div className="pointer-events-none absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-black to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-black to-transparent" />
      </div>
    </section>
  );
}

