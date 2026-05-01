import React, { useEffect, useState } from "react";
import { usePrefersReducedMotion } from "../../hooks/usePrefersReducedMotion";
import { LANDING_DEMO_PHRASES } from "./demoPhrases";

const ROTATE_MS = 3200;

export const LandingDemoStrip: React.FC = () => {
  const reduceMotion = usePrefersReducedMotion();
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (reduceMotion) return;
    const id = window.setInterval(() => {
      setIndex((i) => (i + 1) % LANDING_DEMO_PHRASES.length);
    }, ROTATE_MS);
    return () => window.clearInterval(id);
  }, [reduceMotion]);

  return (
    <div className="max-w-2xl mx-auto px-6">
      <div className="rounded-2xl border border-border-secondary/80 bg-bg-secondary/60 backdrop-blur-sm p-8 shadow-[0_0_0_1px_rgba(59,130,246,0.06)]">
        <p className="text-text-muted text-xs font-semibold uppercase tracking-[0.2em] mb-6 text-center">
          I want to learn how to…
        </p>

        <div
          className="relative h-[4.5rem] md:h-[5rem] flex items-center justify-center rounded-xl border border-border-primary bg-bg-primary/50 overflow-hidden"
          aria-live={reduceMotion ? "off" : "polite"}
        >
          {reduceMotion ? (
            <p className="px-4 text-center text-lg md:text-xl font-medium text-accent-light">
              {LANDING_DEMO_PHRASES[0]}
            </p>
          ) : (
            <>
              {LANDING_DEMO_PHRASES.map((phrase, i) => (
                <p
                  key={phrase}
                  className={`absolute inset-x-4 flex items-center justify-center text-center text-lg md:text-xl font-medium transition-opacity duration-700 ease-out ${
                    i === index
                      ? "z-10 opacity-100 text-accent-light"
                      : "z-0 opacity-0 text-text-secondary pointer-events-none"
                  }`}
                >
                  {phrase}
                </p>
              ))}
            </>
          )}
        </div>

        <p className="mt-6 text-center text-sm text-text-muted">
          Each goal unfolds into a visual path—zoom the map, complete nodes, unlock what&apos;s next.
        </p>
      </div>
    </div>
  );
};
