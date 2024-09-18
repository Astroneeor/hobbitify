import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import SkillNode from "./SkillNode";

interface Skill {
  Name: string;
  Description: string;
  Completion: string;
  Children?: string[];
  Difficulty: number;
}

const SkillTree: React.FC = () => {
  const location = useLocation();
  const [skills, setSkills] = useState<Skill[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (useManualJson) {
      setSkills(manualSkillTreeJson);
    } else if (location.state?.response) {
      try {
        // Sanitize response string and remove any newline characters or extra spaces
        const cleanedResponse = location.state.response
          .replace(/\r?\n|\r/g, "") // Remove newline characters
          .trim(); // Trim whitespace from the start and end

        // Attempt to parse the cleaned response into a JSON object
        const parsedJson = JSON.parse(cleanedResponse);
        setSkills(parsedJson);
      } catch (error) {
        console.error("Invalid JSON format:", error);
        setError(
          `There was an issue loading the skill data. Invalid JSON format.`
        );
      }
    }
  }, [location.state]);

  if (error) {
    return (
      <div className="p-8 dark:bg-gray-900 dark:text-white">
        <>
          {error}
          {JSON.stringify(location.state?.response)}
        </>
      </div>
    );
  }

  // Determine the root skills (skills without a parent)
  // Filter to get the root skills (those that are not listed as children of other skills)
  const rootSkills = skills.filter(
    (skill) => !skills.some((s) => s.Children?.includes(skill.Name))
  );

  return (
    <div className="p-8 dark:bg-gray-900 dark:text-white">
      <h1 className="text-3xl font-bold mb-6">Skill Tree</h1>
      {skills.length > 0 ? (
        <div className="overflow-x-auto">
          <div className="skill-tree inline-flex justify-center min-w-full pb-8 pt-8">
            {rootSkills.map((skill, index) => (
              <SkillNode
                key={index}
                skill={skill}
                allSkills={skills}
                level={0}
              />
            ))}
          </div>
        </div>
      ) : (
        <>
          <p>There was an issue loading the skill data. Invalid JSON format.</p>
          <p>Result: {location.state.response}</p>
        </>
      )}
    </div>
  );
};

export default SkillTree;
