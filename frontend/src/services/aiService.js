import axios from "axios";

export const askAI = async (message, weatherContext) => {
  const res = await axios.post(
    "http://localhost:8000/api/ai/chat/",
    {
      message,
      weather_context: weatherContext,
    }
  );

  return res.data.reply;
};