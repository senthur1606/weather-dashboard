import axios from "axios";

const API_URL =
  process.env.REACT_APP_API_URL ||
  "http://localhost:8000/api";

export const askAI = async (message, weatherContext) => {
  const res = await axios.post(
    `${API_URL}/ai/chat/`,
    {
      message,
      weather_context: weatherContext,
    }
  );

  return res.data.reply;
};