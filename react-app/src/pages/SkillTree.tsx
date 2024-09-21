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
    if (location.state?.response) {
      // Log the response for debugging purposes
      console.log("Response to parse: ", location.state.response);

      // Parse the JSON string if it's not already an object/array
      let parsedJson;
      try {
        if (typeof location.state.response === 'string') {
          parsedJson = JSON.parse(location.state.response); // Parse if string
        } else {
          parsedJson = (location.state.response); // Already an object
        }
        console.log(parsedJson)
        
        // Check if parsedJson is an array and assign it to skills state
      } catch (error) {
        console.error("Invalid JSON format:", error);
        setError("There was an issue loading the skill data. Invalid JSON format.");
      }
      if (Array.isArray(parsedJson)) {
        setSkills(parsedJson);
      } else {
        setError("Expected an array of skills but received something else.");
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
          <p>There was an issue loading the skill data.</p>
          <p>Result: {JSON.stringify(location.state?.response)}</p> {/* Show the raw response */}
        </>
      )}
    </div>
  );
};

export default SkillTree;
