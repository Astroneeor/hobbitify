let skilltreedata = null;

async function fetchSkillTree() {
    const url = 'https://70803d49-af6e-440b-babd-f5e030b01349-00-2ubwx5yb03fkv.kirk.replit.dev/';
    const data = {
        "exampleKey": "exampleValue"
    };

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });

        // Parse the JSON response
        skilltreedata = await response.json();

        // The actual skill data is in the result property as a string
        const skillDataString = skilltreedata.result;
        const skillData = JSON.parse(skillDataString); // Parse the inner JSON string

        generateSkillTree(skillData); // Pass the parsed data to generateSkillTree
    } catch (error) {
        console.error('Error:', error);
    }
}

function generateSkillTree(skillData) {
    let skilltreecontainer = document.getElementById("json-display");
    skilltreecontainer.innerHTML = '';

    // Access the mainskill and subskills
    let mainskill = skillData.Mainskill;
    let subskills = skillData.Subskills;

    // Create a header for the main skill
    let mainskillHeader = document.createElement("h2");
    mainskillHeader.textContent = mainskill;
    skilltreecontainer.appendChild(mainskillHeader);

    // Iterate through each subskill
    for (const [subskillKey, subskill] of Object.entries(subskills)) {
        let subskillContainer = document.createElement("div");
        subskillContainer.className = "subskill-container";
        
        let subskillHeader = document.createElement("h3");
        subskillHeader.textContent = subskillKey;
        subskillContainer.appendChild(subskillHeader);

        // Create containers for different levels
        for (const [levelKey, level] of Object.entries(subskill)) {
            let levelContainer = document.createElement("div");
            levelContainer.className = "level-container";

            let levelHeader = document.createElement("h4");
            levelHeader.textContent = levelKey; // Beginner, Intermediate, etc.
            levelContainer.appendChild(levelHeader);

            let description = document.createElement("p");
            description.textContent = level.Description; // Level description
            levelContainer.appendChild(description);

            let instruction = document.createElement("p");
            instruction.textContent = level.Instruction; // Level instruction
            levelContainer.appendChild(instruction);

            subskillContainer.appendChild(levelContainer);
        }

        skilltreecontainer.appendChild(subskillContainer);
    }
}

// Call the function to fetch the skill tree data
fetchSkillTree();
