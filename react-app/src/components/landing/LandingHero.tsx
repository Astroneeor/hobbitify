import React from "react";
import { JourneyMotif } from "./JourneyMotif";

interface LandingHeroProps {
  reduceMotion: boolean;
}

export const LandingHero: React.FC<LandingHeroProps> = ({ reduceMotion }) => (
  <section className="relative min-h-[100dvh] flex flex-col justify-center overflow-hidden pt-6 pb-16 md:pb-24">
    {/* Ambient layers */}
    <div className="pointer-events-none absolute inset-0 -z-10 bg-bg-primary" aria-hidden />
    <div
      className={`pointer-events-none absolute -top-[45%] left-1/2 h-[85%] w-[140%] -translate-x-1/2 rounded-full bg-[radial-gradient(ellipse_at_center,rgba(59,130,246,0.14),transparent_65%)] blur-3xl ${reduceMotion ? "opacity-40" : "landing-orb-drift"}`}
      aria-hidden
    />
    <div
      className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_80%_60%_at_50%_-20%,rgba(59,130,246,0.18),transparent_55%)]"
      aria-hidden
    />
    <div
      className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_60%_50%_at_100%_80%,rgba(37,99,235,0.12),transparent_50%)]"
      aria-hidden
    />
    <div className="landing-grain pointer-events-none absolute inset-0 -z-10 opacity-[0.035]" aria-hidden />

    <div className="max-w-6xl mx-auto px-6 w-full">
      <div className="grid lg:grid-cols-[minmax(0,1fr)_minmax(0,420px)] gap-12 lg:gap-8 items-center">
        <div className="text-center lg:text-left">
          <p
            className={`text-[11px] sm:text-xs font-semibold uppercase tracking-[0.35em] text-accent-light/90 mb-6 ${reduceMotion ? "" : "animate-hero-kicker"}`}
          >
            Learning as an adventure
          </p>
          <h1 className="text-[clamp(2.25rem,6vw,3.75rem)] font-semibold leading-[1.08] text-text-primary mb-2">
            <span className={`block ${reduceMotion ? "" : "animate-hero-line-a"}`}>
              Turn any skill into
            </span>
            <span
              className={`block mt-1 font-display bg-gradient-to-r from-white via-accent-light to-accent-primary bg-clip-text text-transparent pb-1 ${reduceMotion ? "" : "animate-hero-line-b"}`}
            >
              an interactive learning journey
            </span>
          </h1>
          <p className="mt-8 max-w-xl mx-auto lg:mx-0 text-base md:text-lg text-text-secondary leading-relaxed">
            Goals become branching paths—each step unlocks the next. Save trees to your library,
            or explore offline with a JSON export.
          </p>
        </div>

        <div
          className={`relative flex justify-center lg:justify-end opacity-90 ${reduceMotion ? "" : "animate-hero-motif"}`}
        >
          <JourneyMotif className="w-full max-w-[min(100%,420px)] h-auto drop-shadow-[0_0_40px_rgba(59,130,246,0.15)]" />
        </div>
      </div>
    </div>
  </section>
);
