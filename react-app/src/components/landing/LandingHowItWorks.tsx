import React from "react";
import { Reveal } from "./Reveal";

const steps = [
  {
    title: "Name your goal",
    body: "Tell Hobbitify what you want to learn—anything from crafts to games to career skills.",
  },
  {
    title: "Follow the path",
    body: "AI lays out a branching tree: prerequisites first, then deeper challenges as you progress.",
  },
  {
    title: "Keep the journey",
    body: "Sign in to save trees in your library, spot similar goals before generating again, and export JSON anytime.",
  },
];

export const LandingHowItWorks: React.FC = () => (
  <section className="max-w-5xl mx-auto px-6 py-20 md:py-28">
    <Reveal>
      <h2 className="text-center text-sm font-semibold uppercase tracking-[0.25em] text-accent-light/90 mb-4">
        How it works
      </h2>
      <p className="text-center text-2xl md:text-3xl font-semibold text-text-primary mb-16 max-w-2xl mx-auto">
        Three beats from goal to library
      </p>
    </Reveal>

    <div className="grid md:grid-cols-3 gap-10 md:gap-12">
      {steps.map((step, i) => (
        <Reveal key={step.title} delayMs={i * 120}>
          <article className="relative md:text-center">
            <div className="flex md:flex-col md:items-center gap-4 md:gap-6">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-accent-primary/40 bg-accent-primary/10 text-sm font-bold text-accent-light md:mx-auto shadow-[0_0_24px_-8px_rgba(59,130,246,0.5)]">
                {i + 1}
              </span>
              <div>
                <h3 className="text-lg font-semibold text-text-primary mb-2">{step.title}</h3>
                <p className="text-text-secondary text-sm leading-relaxed">{step.body}</p>
              </div>
            </div>
          </article>
        </Reveal>
      ))}
    </div>
  </section>
);
