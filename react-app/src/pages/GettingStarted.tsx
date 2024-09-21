import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const GettingStarted: React.FC = () => {
  const [inputValue, setInputValue] = useState("");  // Manages input value
  const [loading, setLoading] = useState(false);     // Manages loading state
  const [error, setError] = useState<string | null>(null); // Manages error state
  const navigate = useNavigate();

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();  // Prevents default form submission behavior
    setLoading(true);    // Set loading to true while waiting for response
    setError(null);      // Clear any previous errors

    const postData = { input: inputValue };  // The data to send to the backend

    try {
      const response = await axios.post(
        "https://306d35ba-df75-4b4a-8c6e-0e3cf5da585f-00-sdz04eqsz56g.kirk.replit.dev/",
        postData
      );

      if (response.status === 200) {
        // Successfully sent data, now redirect to the skill tree page
        console.log("Data submitted successfully:", response.data);
        // Pass data to the skill tree page
        navigate("/skill-tree", { state: { response: response.data } });
      } else {
        setError("Failed to submit data");
      }
    } catch (error) {
      console.error("Error submitting data:", error);
      setError("An error occurred while submitting data.");
    } finally {
      setLoading(false);  // Reset loading state once the request is complete
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

        {error && <p className="text-red-500">{error}</p>} {/* Displays errors */}

        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:bg-blue-300"
          disabled={loading || inputValue.trim() === ""}  // Disables button if loading or input is empty
        >
          {loading ? "Submitting..." : "Submit"} {/* Show loading state */}
        </button>
      </form>
    </div>
  );
};

export default GettingStarted;
