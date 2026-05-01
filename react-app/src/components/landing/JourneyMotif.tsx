import React from "react";

/** Decorative SVG — aria-hidden for screen readers. */
export const JourneyMotif: React.FC<{ className?: string }> = ({ className = "" }) => (
  <svg
    className={className}
    viewBox="0 0 400 280"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden
  >
    <defs>
      <linearGradient id="journeyStroke" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#60a5fa" stopOpacity="0.9" />
        <stop offset="50%" stopColor="#3b82f6" stopOpacity="0.5" />
        <stop offset="100%" stopColor="#2563eb" stopOpacity="0.25" />
      </linearGradient>
      <filter id="glow" x="-40%" y="-40%" width="180%" height="180%">
        <feGaussianBlur stdDeviation="4" result="blur" />
        <feMerge>
          <feMergeNode in="blur" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
    </defs>
    <path
      d="M40 220 Q120 180 180 140 T320 60"
      stroke="url(#journeyStroke)"
      strokeWidth="2.5"
      strokeLinecap="round"
      fill="none"
      filter="url(#glow)"
    />
    <path
      d="M180 140 Q240 100 280 120 T360 40"
      stroke="url(#journeyStroke)"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeOpacity="0.45"
      fill="none"
    />
    <circle cx="40" cy="220" r="6" fill="#60a5fa" opacity="0.95" />
    <circle cx="180" cy="140" r="5" fill="#3b82f6" opacity="0.85" />
    <circle cx="320" cy="60" r="5" fill="#60a5fa" opacity="0.75" />
    <circle cx="360" cy="40" r="4" fill="#93c5fd" opacity="0.65" />
  </svg>
);
