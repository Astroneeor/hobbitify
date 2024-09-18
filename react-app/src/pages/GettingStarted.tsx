import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const GettingStarted: React.FC = () => {
  const [inputValue, setInputValue] = useState(""); // State to hold user input
  const navigate = useNavigate(); // For navigating to the skill tree page

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); // Prevent default form reload

    const postData = { input: inputValue }; // Prepare data for the POST request

    try {
      const response = await axios.post(
        "https://306d35ba-df75-4b4a-8c6e-0e3cf5da585f-00-sdz04eqsz56g.kirk.replit.dev/", // Update with your actual backend URL
        postData
      );

      if (response.status === 200) {
        // Successfully sent data, now navigate to the skill tree page with the response data
        console.log("Data submitted successfully:", response.data.result);
        navigate("/skill-tree", { state: { response: response.data.result } }); // Send response to SkillTree
      } else {
        setError("Failed to submit data");
      }
    } catch (error) {
      console.error("Error submitting data:", error); // Error handling if request fails
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen dark:bg-gray-900 dark:text-white">
      <h1 className="text-2xl font-bold mb-4">Getting Started</h1>
      <form onSubmit={handleSubmit} className="flex flex-col space-y-4">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)} // Capture input value
          placeholder="Enter your skill focus"
          className="border-2 border-gray-300 p-2 rounded-md w-80 dark:bg-gray-700 dark:border-gray-500"
        />
        {error && <p className="text-red-500">{error}</p>}{" "}
        {/* Displays errors */}
        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:bg-blue-300"
          disabled={loading || inputValue.trim() === ""} // Disables button if loading or input is empty
        >
          {loading ? "Submitting..." : "Submit"} {/* Show loading state */}
        </button>
      </form>
    </div>
  );
};

export default GettingStarted;
