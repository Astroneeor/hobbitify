import React from "react";
import { Reveal } from "./Reveal";

const features = [
  {
    title: "AI-powered",
    body: "Claude builds structured skill trees from your goals. Free tier includes limited generations—upload JSON for more offline trees.",
    icon: (
      <svg className="w-7 h-7 text-accent-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
    accent: "bg-accent-primary/15 border-accent-primary/25",
  },
  {
    title: "Your library",
    body: "Sign in with Supabase to save trees, preview similar past goals before spending a generation, and curate what stays.",
    icon: (
      <svg className="w-7 h-7 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
    accent: "bg-success/10 border-success/25",
  },
  {
    title: "Structured learning",
    body: "Complex skills break into steps each with concrete completion criteria and unlock rules—like checkpoints on a quest line.",
    icon: (
      <svg className="w-7 h-7 text-warning" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
      </svg>
    ),
    accent: "bg-warning/10 border-warning/25",
  },
];

export const LandingFeatures: React.FC = () => (
  <section className="max-w-6xl mx-auto px-6 pb-12 md:pb-16">
    <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
      {features.map((f, i) => (
        <Reveal key={f.title} delayMs={i * 80}>
          <article
            className={`group h-full rounded-2xl border border-border-primary ${f.accent} bg-bg-tertiary/80 p-8 transition-all duration-300 hover:border-accent-primary/30 hover:shadow-[0_0_40px_-12px_rgba(59,130,246,0.35)] hover:-translate-y-1`}
          >
            <div className="mb-6 inline-flex h-14 w-14 items-center justify-center rounded-xl bg-bg-primary/60 border border-border-secondary group-hover:border-accent-primary/25 transition-colors">
              {f.icon}
            </div>
            <h3 className="text-xl font-semibold text-text-primary mb-3">{f.title}</h3>
            <p className="text-text-secondary text-sm leading-relaxed">{f.body}</p>
          </article>
        </Reveal>
      ))}
    </div>
  </section>
);
