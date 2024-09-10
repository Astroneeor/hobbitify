import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const GettingStarted: React.FC = () => {
  const [inputValue, setInputValue] = useState("");
  const navigate = useNavigate();

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const postData = { input: inputValue };

    try {
      const response = await axios.post(
        "http://localhost:5000/submit",
        postData
      );

      if (response.status === 200) {
        // Successfully sent data, now redirect to the skill tree page
        console.log("Data submitted successfully:", response.data);
        // Pass data to the skill tree page
        navigate("/skill-tree", { state: { skillInput: inputValue } });
      } else {
        console.error("Failed to submit data");
      }
    } catch (error) {
      console.error("Error submitting data:", error);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen dark:bg-gray-900 dark:text-white">
      <h1 className="text-2xl font-bold mb-4">Getting Started</h1>
      <form onSubmit={handleSubmit} className="flex flex-col space-y-4">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Enter your skill focus"
          className="border-2 border-gray-300 p-2 rounded-md w-80 dark:bg-gray-700 dark:border-gray-500"
        />
        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Submit
        </button>
      </form>
    </div>
  );
};

export default GettingStarted;
