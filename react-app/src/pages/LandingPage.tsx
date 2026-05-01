import React, { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CSS_SKILL_TREE } from "../data/testSkillTrees";
import { useAuth } from "../contexts/AuthContext";
import { usePrefersReducedMotion } from "../hooks/usePrefersReducedMotion";
import { LandingActions } from "../components/landing/LandingActions";
import { LandingDemoStrip } from "../components/landing/LandingDemoStrip";
import { LandingFeatures } from "../components/landing/LandingFeatures";
import { LandingFooter } from "../components/landing/LandingFooter";
import { LandingHero } from "../components/landing/LandingHero";
import { LandingHowItWorks } from "../components/landing/LandingHowItWorks";
import { LandingNav } from "../components/landing/LandingNav";
import { Reveal } from "../components/landing/Reveal";

const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const { session, loading } = useAuth();
  const reduceMotion = usePrefersReducedMotion();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  const handleExample = () => {
    navigate("/skill-tree", { state: { response: CSS_SKILL_TREE } });
  };

  const handleLoadClick = () => {
    setLoadError(null);
    fileInputRef.current?.click();
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const raw = ev.target?.result;
        if (typeof raw !== "string") {
          setLoadError("Unable to read file contents.");
          return;
        }

        const parsed = JSON.parse(raw);
        navigate("/skill-tree", { state: { response: parsed } });
      } catch {
        setLoadError("Invalid JSON file. Please pick a valid export.");
      }
    };
    reader.onerror = () => {
      setLoadError("Failed to read selected file.");
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  return (
    <div className="min-h-screen bg-bg-primary text-text-primary">
      <LandingNav loading={loading} session={session} />

      <LandingHero reduceMotion={reduceMotion} />

      <Reveal>
        <LandingDemoStrip />
      </Reveal>

      <Reveal>
        <LandingActions
          session={session}
          loadError={loadError}
          fileInputRef={fileInputRef}
          onExample={handleExample}
          onLoadClick={handleLoadClick}
          onImport={handleImport}
        />
      </Reveal>

      <LandingHowItWorks />

      <LandingFeatures />

      <LandingFooter session={session} />
    </div>
  );
};

export default LandingPage;
