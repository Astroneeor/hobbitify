import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const GettingStarted: React.FC = () => {
  const [inputValue, setInputValue] = useState(""); // Manages input value
  const [loading, setLoading] = useState(false); // Manages loading state
  const [error, setError] = useState<string | null>(null); // Manages error state
  const navigate = useNavigate();

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); // Prevents default form submission behavior
    setLoading(true); // Set loading to true while waiting for response
    setError(null); // Clear any previous errors

    const postData = { input: inputValue }; // The data to send to the backend

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
      setLoading(false); // Reset loading state once the request is complete
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-bg text-primary-100 font-Manrope">
      <h1 className="text-2xl font-bold mb-4">Getting Started</h1>
      <form
        onSubmit={handleSubmit}
        className="flex flex-col space-y-4 w-full max-w-md"
      >
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Enter your skill focus"
          className="border-2 border-primary-300 p-2 rounded-md bg-gray-600 text-primary-100 focus:ring-2 focus:ring-primary-200"
        />
        {error && <p className="text-red-500">{error}</p>}{" "}
        {/* Displays errors */}
        <button
          type="submit"
          className="bg-primary-200 text-white px-4 py-2 rounded hover:bg-primary-300 disabled:bg-gray-800 transition-colors duration-300"
          disabled={loading || inputValue.trim() === ""}
        >
          {loading ? "Submitting..." : "Submit"} {/* Show loading state */}
        </button>
      </form>
    </div>
  );
};

export default GettingStarted;
