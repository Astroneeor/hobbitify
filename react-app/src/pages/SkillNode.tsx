import React, { useState } from "react";

interface Skill {
  Name: string;
  Description: string;
  Completion: string;
  Children?: string[];
  Difficulty: number;
}

const SkillNode: React.FC<{
  skill: Skill;
  allSkills: Skill[];
  level: number;
}> = ({ skill, allSkills, level }) => {
  const [isSelected, setIsSelected] = useState(false);

  const childSkills =
    skill.Children?.map((childName) =>
      allSkills.find((s) => s.Name === childName)
    ).filter((s): s is Skill => s !== undefined) || [];

  return (
    <div className="flex flex-col items-center relative">
      <div
        className={`w-64 p-4 m-2 rounded-md cursor-pointer transition-all duration-300 ${
          isSelected ? "bg-blue-500 text-white" : "bg-gray-200 dark:bg-gray-800"
        }`}
        onClick={() => setIsSelected(!isSelected)}
      >
        <h3 className="text-lg font-bold truncate">{skill.Name}</h3>
        <p className="text-sm h-12 overflow-hidden">{skill.Description}</p>
        <p className="text-xs mt-2">Difficulty: {skill.Difficulty}</p>
      </div>

      {childSkills.length > 0 && (
        <>
          <div className="w-px h-8 bg-gray-400 my-2" />
          <div className="flex justify-center">
            {childSkills.map((childSkill, index) => (
              <div key={index} className="relative">
                <SkillNode
                  skill={childSkill}
                  allSkills={allSkills}
                  level={level + 1}
                />
                {index < childSkills.length - 1 && (
                  <div className="absolute w-full h-px bg-gray-400 top-0 left-1/2" />
                )}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default SkillNode;
