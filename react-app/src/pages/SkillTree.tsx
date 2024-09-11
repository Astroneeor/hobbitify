import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import SkillNode from "./SkillNode";
import response from "./GettingStarted";

interface Skill {
  Name: string;
  Description: string;
  Completion: string;
  Children?: string[];
  Difficulty: number;
}

// Sample JSON to use when POST request is disabled
const manualSkillTreeJson = [
  {
    Name: "Basic Ableton Navigation",
    Description: "Learn to navigate Ableton's interface",
    Completion:
      "Open Ableton and identify the Session View, Arrangement View, Browser, and Device View",
    Children: [
      "Audio Recording Basics",
      "MIDI Basics",
      "Ableton Instruments",
      "Basic Mixing",
      "Basic Arrangement",
    ],
    Difficulty: 5,
  },
  {
    Name: "Audio Recording Basics",
    Description: "Learn to record audio in Ableton",
    Completion:
      "Successfully record a 30-second audio clip using a microphone or instrument input",
    Children: ["Audio Editing", "Multitrack Recording"],
    Difficulty: 10,
  },
  {
    Name: "MIDI Basics",
    Description: "Understand MIDI in Ableton",
    Completion: "Create a simple 4-bar MIDI melody using Ableton's piano roll",
    Children: ["MIDI Programming", "MIDI Effects"],
    Difficulty: 15,
  },
  {
    Name: "Ableton Instruments",
    Description: "Explore Ableton's built-in instruments",
    Completion:
      "Create a short melody using three different Ableton instruments",
    Children: ["Sound Design Basics", "VST Integration"],
    Difficulty: 20,
  },
  {
    Name: "Basic Mixing",
    Description: "Learn fundamental mixing techniques",
    Completion: "Adjust volume, panning, and EQ on a 4-track project",
    Children: ["Advanced Mixing", "Compression Basics"],
    Difficulty: 25,
  },
  {
    Name: "Basic Arrangement",
    Description: "Arrange a simple song structure",
    Completion:
      "Create a 1-minute arrangement with intro, verse, and chorus sections",
    Children: ["Advanced Arrangement", "Song Structure"],
    Difficulty: 30,
  },
  {
    Name: "Audio Editing",
    Description: "Edit and manipulate audio clips",
    Completion: "Trim, fade, and warp an audio clip to fit a specific tempo",
    Children: ["Advanced Audio Editing", "Sampling"],
    Difficulty: 35,
  },
  {
    Name: "Multitrack Recording",
    Description: "Record multiple audio sources simultaneously",
    Completion: "Record a 3-instrument performance using separate tracks",
    Children: ["Live Recording", "Studio Recording Techniques"],
    Difficulty: 40,
  },
  {
    Name: "MIDI Programming",
    Description: "Create complex MIDI patterns",
    Completion: "Program a 16-bar drum pattern using MIDI",
    Children: ["Advanced MIDI Techniques", "Generative MIDI"],
    Difficulty: 45,
  },
  {
    Name: "MIDI Effects",
    Description: "Use Ableton's MIDI effects",
    Completion: "Apply arpeggiator, chord, and scale effects to a MIDI clip",
    Children: ["Custom MIDI Effects", "MIDI Routing"],
    Difficulty: 50,
  },
  {
    Name: "Sound Design Basics",
    Description: "Create custom sounds using Ableton's instruments",
    Completion: "Design a unique bass sound using Operator or Wavetable",
    Children: ["Advanced Sound Design", "Synthesis Techniques"],
    Difficulty: 55,
  },
  {
    Name: "VST Integration",
    Description: "Incorporate third-party VST plugins",
    Completion: "Install and use a VST instrument in an Ableton project",
    Children: ["Plugin Chains", "CPU Optimization"],
    Difficulty: 60,
  },
  {
    Name: "Advanced Mixing",
    Description: "Apply professional mixing techniques",
    Completion: "Mix a 12-track song, balancing levels, EQ, and stereo image",
    Children: ["Mastering Basics", "Spatial Audio Mixing"],
    Difficulty: 65,
  },
  {
    Name: "Compression Basics",
    Description: "Understand and apply audio compression",
    Completion: "Use compression on drums, bass, and vocals in a mix",
    Children: ["Advanced Compression Techniques", "Multiband Compression"],
    Difficulty: 70,
  },
  {
    Name: "Advanced Arrangement",
    Description: "Create complex song arrangements",
    Completion:
      "Arrange a 3-minute song with multiple sections and transitions",
    Children: ["Remixing", "Production Techniques"],
    Difficulty: 75,
  },
  {
    Name: "Song Structure",
    Description: "Understand and implement various song structures",
    Completion:
      "Create three songs with different structures (e.g., AABA, Verse-Chorus-Bridge)",
    Children: ["Advanced Songwriting", "Genre-Specific Structures"],
    Difficulty: 80,
  },
  {
    Name: "Advanced Audio Editing",
    Description: "Master advanced audio editing techniques",
    Completion:
      "Perform complex audio edits like pitch correction and time-stretching",
    Children: ["Sound Restoration", "Audio to MIDI Conversion"],
    Difficulty: 85,
  },
  {
    Name: "Sampling",
    Description: "Create and manipulate audio samples",
    Completion: "Create a beat using self-recorded and manipulated samples",
    Children: ["Advanced Sampling Techniques", "Sample-Based Composition"],
    Difficulty: 85,
  },
  {
    Name: "Live Recording",
    Description: "Record and produce live performances in Ableton",
    Completion: "Record and edit a live band performance using Ableton",
    Children: ["Live Looping", "Performance Mode"],
    Difficulty: 90,
  },
  {
    Name: "Studio Recording Techniques",
    Description: "Apply professional studio recording methods",
    Completion:
      "Plan and execute a full day of studio recording for a 5-piece band",
    Difficulty: 95,
  },
  // (Other skills as provided)
];

const SkillTree: React.FC = () => {
  const location = useLocation();
  const [skills, setSkills] = useState<Skill[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Toggle this flag to use POST or manual JSON
  const useManualJson = false;

  useEffect(() => {
    if (useManualJson) {
      // Set the manual skill tree data if the toggle is set
      setSkills(manualSkillTreeJson);
    } else if (location.state?.response) {
      // Log the response for debugging purposes
      console.log("Response to parse: ", location.state.response);

      // Initialize parsedJson as Skill[]
      let parsedJson: Skill[] = [];
      try {
        // Parse the JSON response and assert the type
        const responseString = `[${location.state.response}]`
        parsedJson = JSON.parse(responseString) as Skill[];
        setSkills(parsedJson); // Set the parsed JSON to skills state
      } catch (error) {
        // If parsing fails, log the error and show an error message
        console.error("Invalid JSON format:", error);
        setError(`There was an issue loading the skill data. Invalid JSON format. ${parsedJson}`);
      }
    }
  }, [location.state, useManualJson]);

  if (error) {
    // Render the error message if there is a parsing error
    return <div className="p-8 dark:bg-gray-900 dark:text-white">{error}</div>;
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
