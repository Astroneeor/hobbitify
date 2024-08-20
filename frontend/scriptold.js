let skilltreedata = null;

async function fetchSkillTree() {
    try {
        const response = await fetch('https://70803d49-af6e-440b-babd-f5e030b01349-00-2ubwx5yb03fkv.kirk.replit.dev/');
        skilltreedata = await response.json();

        generateSkillTree(skilltreedata)
    } catch(error) {
        console.error('error', error)
    }
}

function generateSkillTree(skilltreedata) {
    let skilltreecontainer = document.getElementById("json-display")
    skilltreecontainer.innerHTML = '';

    skilltreedata.levels.forEach(level => {
        let levelcontainer = document.createElement("div");
        levelcontainer.className = "level-container";

        let levelheader = document.createElement("h2");
        levelheader.textContent = level.level;
        levelcontainer.appendChild(levelheader);

        let skillgrid = document.createElement("div");
        skillgrid.className = "skill-grid";

        levels.skills.forEach(skill => {
            let skillcard = document.createElement("h3");
            skillcard.className = "skill-card";

            let skilltitle = document.createElement("h3");
            skilltitle.textContent = skill.title;
            skillcard.appendChild(skilltitle);

            let skilldescription = document.createElement("p");
            skilldescription.textContent = skill.description;
            skillcard.appendChild(skilldescription);

            let checkbox = document.createElement("input");
            checkbox.type = "checkbox";
            checkbox.id = skill.title.replace(/\s+/g, "-").toLowerCase();
            skillcard.appendChild(checkbox);

            skillgrid.appendChild(skillcard);
        });
        levelcontainer.appendChild(skillgrid);
    })
}

fetchSkillTree();