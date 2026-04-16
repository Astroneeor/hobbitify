import os
import json
from flask import Flask, request, jsonify
from flask_cors import CORS
from anthropic import Anthropic
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
CORS(app)

client = Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))

SYSTEM_PROMPT = """You are an expert skill tree designer. Given a learning goal, generate a structured skill tree as a JSON array.

Each skill in the array must have:
- "Name": A concise skill/topic name
- "Description": A 1-2 sentence description of what this skill covers
- "Completion": A specific, concrete project or task that proves mastery of this skill
- "Children": An array of child skill names (strings) that this skill unlocks. Leaf nodes should have an empty array [].
- "Difficulty": A number from 1-100 representing the progression from hobbyist to master

Difficulty scale:
- 1-15: Complete beginner. Casual hobbyist picking up the basics for the first time.
- 16-30: Developing hobbyist. Building foundational skills through simple projects.
- 31-50: Serious enthusiast. Intermediate techniques, starting to develop personal style.
- 51-70: Advanced practitioner. Complex projects, deep understanding of theory and practice.
- 71-85: Professional/expert level. Portfolio-worthy work, teaching others, pushing boundaries.
- 86-100: Master level. Original research, thesis-level projects, contributions to the field. Very few skills should reach this level.

Rules:
- Generate 10-18 skills total
- Create a tree structure with 1-2 root skills and 3-5 levels of depth
- Every name referenced in a "Children" array MUST exist as a skill in the array
- Difficulty should generally increase as you go deeper in the tree
- Root skills should start at 5-20, deepest leaf skills can reach 80-100
- Completion tasks should be concrete projects, not vague instructions (e.g. "Build a dovetail jewelry box without power tools" not "Practice dovetail joints")
- The highest-difficulty skills should feel like master's thesis projects or professional milestones
- Keep most skills (70%+) under difficulty 60 — mastery is rare

Respond with ONLY the JSON array, no markdown formatting, no code blocks, no explanation."""


@app.route("/", methods=["POST"])
def generate_skill_tree():
    data = request.get_json()
    if not data or "input" not in data:
        return jsonify({"error": "Missing 'input' field"}), 400

    user_input = data["input"].strip()
    if len(user_input) < 3:
        return jsonify({"error": "Input must be at least 3 characters"}), 400
    if len(user_input) > 500:
        return jsonify({"error": "Input must be less than 500 characters"}), 400

    try:
        message = client.messages.create(
            model="claude-haiku-4-5-20251001",
            max_tokens=4096,
            system=SYSTEM_PROMPT,
            messages=[
                {
                    "role": "user",
                    "content": f"Create a skill tree for learning: {user_input}",
                }
            ],
        )

        response_text = message.content[0].text.strip()

        # Strip markdown code blocks if present
        if response_text.startswith("```"):
            response_text = response_text.split("\n", 1)[1]
            if response_text.endswith("```"):
                response_text = response_text[:-3].strip()

        skills = json.loads(response_text)

        if not isinstance(skills, list):
            return jsonify({"error": "AI returned invalid format"}), 500

        return jsonify(skills)

    except json.JSONDecodeError:
        return jsonify({"error": "Failed to parse AI response as JSON"}), 500
    except Exception as e:
        print(f"Error: {e}")
        return jsonify({"error": "Failed to generate skill tree"}), 500


@app.route("/", methods=["GET"])
def health_check():
    return jsonify({"status": "ok"})


if __name__ == "__main__":
    app.run(debug=True, port=5000)
