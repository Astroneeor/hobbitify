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
    reader.onerror = () => setLoadError("Failed to read selected file.");
    reader.readAsText(file);
    e.target.value = "";
  };

  return (
    <div style={{ overflowX: "hidden" }}>
      <LandingNav loading={loading} session={session} />

      <div
        style={{
          overflowY: "auto",
          overflowX: "hidden",
          maxHeight: "calc(100vh - 64px)",
        }}
      >
        <LandingHero reduceMotion={reduceMotion} />

        <LandingActions
          session={session}
          loadError={loadError}
          fileInputRef={fileInputRef}
          onExample={handleExample}
          onLoadClick={handleLoadClick}
          onImport={handleImport}
        />

        <LandingFeatures />

        <LandingDemoStrip />

        <LandingHowItWorks />

        <LandingFooter session={session} />
      </div>
    </div>
  );
};

export default LandingPage;
