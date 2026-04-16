import React, { useState, useEffect } from "react";
import { useLocation, Link } from "react-router-dom";
import SkillNode from "../components/skill-tree/SkillNode";
import { Skill } from "../types/skill";


const SkillTree: React.FC = () => {
  const location = useLocation();
  const [skills, setSkills] = useState<Skill[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [selectedSkill, setSelectedSkill] = useState<string | null>(null);
  const [completedSkills, setCompletedSkills] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (location.state?.response) {
      console.log("Response to parse: ", location.state.response);

      let parsedJson;
      try {
        if (typeof location.state.response === "string") {
          parsedJson = JSON.parse(location.state.response);
        } else {
          parsedJson = location.state.response;
        }
        
        if (Array.isArray(parsedJson)) {
          setSkills(parsedJson);
        } else {
          setError("Expected an array of skills but received something else.");
        }
      } catch (error) {
        console.error("Invalid JSON format:", error);
        setError("There was an issue loading the skill data. Invalid JSON format.");
      }
    } else {
      setError("No skill tree data found. Please go back and generate a skill tree first.");
    }
  }, [location.state]);

  const rootSkills = skills.filter(
    (skill) => !skills.some((s) => s.Children?.includes(skill.Name))
  );

  const getSelectedSkillData = () => {
    return skills.find((skill) => skill.Name === selectedSkill);
  };

  const handleSkillComplete = (skillName: string) => {
    setCompletedSkills(prev => new Set([...prev, skillName]));
  };

  const isSkillUnlocked = (skillName: string): boolean => {
    const skill = skills.find(s => s.Name === skillName);
    if (!skill) return false;
    
    // Root skills are always unlocked
    const isRoot = !skills.some(s => s.Children?.includes(skillName));
    if (isRoot) return true;
    
    // Find parent skill and check if it's completed
    const parentSkill = skills.find(s => s.Children?.includes(skillName));
    return parentSkill ? completedSkills.has(parentSkill.Name) : true;
  };

  if (error) {
    return (
      <div className="min-h-screen bg-bg-primary text-text-primary">
        <nav className="border-b border-border-primary">
          <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
            <Link to="/" className="text-xl font-semibold hover:text-accent-light transition-colors">
              hobbitify
            </Link>
            <Link 
              to="/getting-started" 
              className="px-4 py-2 bg-accent-primary hover:bg-accent-hover text-white rounded-lg transition-all duration-200"
            >
              Try Again
            </Link>
          </div>
        </nav>
        
        <div className="max-w-2xl mx-auto px-6 pt-16">
          <div className="bg-error/10 border border-error/20 rounded-xl p-8 text-center">
            <div className="w-16 h-16 bg-error/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-error" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold mb-2 text-error">Unable to Load Skill Tree</h2>
            <p className="text-text-secondary mb-6">{error}</p>
            <Link 
              to="/getting-started" 
              className="inline-flex items-center px-4 py-2 bg-accent-primary hover:bg-accent-hover text-white rounded-lg transition-all duration-200"
            >
              Generate New Skill Tree
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-primary text-text-primary">
      {/* Navigation */}
      <nav className="border-b border-border-primary sticky top-0 bg-bg-primary/95 backdrop-blur-sm z-40">
        <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
          <Link to="/" className="text-xl font-semibold hover:text-accent-light transition-colors">
            hobbitify
          </Link>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-text-secondary">
              {completedSkills.size}/{skills.length} completed
            </span>
            <Link 
              to="/getting-started" 
              className="text-text-secondary hover:text-text-primary transition-colors"
            >
              Generate New
            </Link>
            <button className="px-4 py-2 border border-border-secondary hover:border-border-primary text-text-secondary hover:text-text-primary rounded-lg transition-all duration-200">
              Export Tree
            </button>
          </div>
        </div>
      </nav>

      <div className="flex">
        {/* Main Skill Tree */}
        <div className="flex-1 p-8">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold mb-2">Your Learning Journey</h1>
              <p className="text-text-secondary">
                Click on any skill to see detailed information. Complete skills in order to unlock new ones.
              </p>
              
              {/* Progress Bar */}
              <div className="mt-4 max-w-md mx-auto">
                <div className="flex justify-between text-sm text-text-secondary mb-2">
                  <span>Progress</span>
                  <span>{Math.round((completedSkills.size / skills.length) * 100)}%</span>
                </div>
                <div className="w-full bg-bg-secondary rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-accent-primary to-success h-2 rounded-full transition-all duration-500"
                    style={{ width: `${(completedSkills.size / skills.length) * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>

            {skills.length > 0 ? (
              <div className="overflow-x-auto pb-8">
                <div className="min-w-max flex justify-center space-x-8">
                  {rootSkills.map((skill, index) => (
                    <SkillNode
                      key={index}
                      skill={skill}
                      allSkills={skills}
                      level={0}
                      onSelect={setSelectedSkill}
                      selectedSkill={selectedSkill}
                      completedSkills={completedSkills}
                      onComplete={handleSkillComplete}
                    />
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-16">
                <div className="animate-spin w-8 h-8 border-2 border-accent-primary border-t-transparent rounded-full mx-auto mb-4"></div>
                <p className="text-text-secondary">Loading your skill tree...</p>
              </div>
            )}
          </div>
        </div>

        {/* Skill Details Sidebar */}
        {selectedSkill && (
          <div className="w-80 bg-bg-secondary border-l border-border-primary p-6 sticky top-16 h-screen overflow-y-auto">
            <div className="mb-4">
              <button 
                onClick={() => setSelectedSkill(null)}
                className="text-text-muted hover:text-text-secondary transition-colors mb-4"
              >
                ← Back to Tree
              </button>
              
              {(() => {
                const skillData = getSelectedSkillData();
                if (!skillData) return null;
                
                const isCompleted = completedSkills.has(skillData.Name);
                const isUnlocked = isSkillUnlocked(skillData.Name);
                
                return (
                  <div>
                    <div className="flex items-center mb-4">
                      <div className={`w-3 h-3 rounded-full mr-3 ${
                        isCompleted ? 'bg-success' :
                        skillData.Difficulty <= 30 ? 'bg-emerald-400' :
                        skillData.Difficulty <= 50 ? 'bg-blue-400' :
                        skillData.Difficulty <= 70 ? 'bg-amber-400' : 'bg-red-400'
                      }`}></div>
                      <span className="text-sm text-text-muted">
                        {isCompleted ? 'Completed' : `Difficulty ${skillData.Difficulty}/100`}
                      </span>
                    </div>
                    
                    <h2 className="text-xl font-bold mb-4">{skillData.Name}</h2>
                    
                    <div className="space-y-4">
                      <div>
                        <h3 className="text-sm font-medium text-text-secondary mb-2">Description</h3>
                        <p className="text-text-primary">{skillData.Description}</p>
                      </div>
                      
                      <div>
                        <h3 className="text-sm font-medium text-text-secondary mb-2">How to Complete</h3>
                        <p className="text-text-primary">{skillData.Completion}</p>
                      </div>
                      
                      {skillData.Children && skillData.Children.length > 0 && (
                        <div>
                          <h3 className="text-sm font-medium text-text-secondary mb-2">This unlocks</h3>
                          <div className="space-y-2">
                            {skillData.Children.map((childName, index) => {
                              const childUnlocked = isSkillUnlocked(childName);
                              const childCompleted = completedSkills.has(childName);
                              
                              return (
                                <button
                                  key={index}
                                  onClick={() => setSelectedSkill(childName)}
                                  className={`block w-full text-left px-3 py-2 rounded-lg text-sm transition-colors duration-200 ${
                                    childCompleted ? 'bg-success/10 text-success border border-success/20' :
                                    childUnlocked ? 'bg-bg-tertiary hover:bg-bg-hover text-text-primary border border-border-secondary' :
                                    'bg-bg-secondary text-text-muted border border-border-primary opacity-60'
                                  }`}
                                  disabled={!childUnlocked}
                                >
                                  <div className="flex items-center justify-between">
                                    <span>{childName}</span>
                                    {childCompleted && (
                                      <svg className="w-4 h-4 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                      </svg>
                                    )}
                                  </div>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      )}
                      
                      <div className="pt-4 border-t border-border-primary">
                        {isCompleted ? (
                          <div className="w-full px-4 py-3 bg-success/10 border border-success/20 text-success rounded-lg font-medium text-center">
                            ✓ Completed
                          </div>
                        ) : isUnlocked ? (
                          <button 
                            onClick={() => handleSkillComplete(skillData.Name)}
                            className="w-full px-4 py-3 bg-accent-primary hover:bg-accent-hover text-white rounded-lg font-medium transition-all duration-200 hover:scale-105"
                          >
                            Mark as Complete
                          </button>
                        ) : (
                          <div className="w-full px-4 py-3 bg-bg-tertiary border border-border-primary text-text-muted rounded-lg font-medium text-center">
                            Complete prerequisites first
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SkillTree;
