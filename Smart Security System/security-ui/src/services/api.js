import axios from "axios";

// Set the base URL to your FastAPI server
const API = axios.create({
  baseURL: "http://127.0.0.1:8000/api",
});

// Centralized function for user registration
export const registerUser = async (userData) => {
  try {
    const response = await API.post("/users/register", userData);
    return response.data;
  } catch (error) {
    // Pass the error message from FastAPI to the frontend
    if (error.response && error.response.data) {
      throw new Error(error.response.data.detail || "Registration failed");
    }
    throw new Error("Network error. Is the backend running?");
  }
};

// We will add loginUser here later!
