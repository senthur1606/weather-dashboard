import React, { useState } from "react";
import { useSelector } from "react-redux";
import { askAI } from "../../services/aiService";

const AIAssistant = () => {
  const reduxCurrent = useSelector((state) => state.weather.current);
  const current = reduxCurrent || JSON.parse(localStorage.getItem("weatherContext"));
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content:
        "👋 Hi! I'm SkyPulse AI. Ask me anything about weather, AQI, travel, clothing suggestions, or forecasts.",
    },
  ]);

  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const question = input;

    setMessages((prev) => [
      ...prev,
      {
        role: "user",
        content: question,
      },
    ]);

    setInput("");
    setLoading(true);

    try {
      const weatherContext = {
        city: current?.city,
        temperature: current?.temperature,
        humidity: current?.humidity,
        wind_speed: current?.wind_speed,
        condition: current?.condition,
      };
      console.log("weather context:", weatherContext);

      const reply = await askAI(
        question,
        weatherContext
      );
      
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: reply,
        },
      ]);
    } catch (error) {
      console.error(error);

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "❌ Sorry, I couldn't generate a response right now.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-12 px-4 md:px-6">
      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <div className="glass-card rounded-3xl p-6 mb-4">
          <h1 className="text-3xl font-bold text-white">
            🤖 SkyPulse AI Assistant
          </h1>

          <p className="text-white/60 mt-2">
            Weather insights, forecasts, AQI analysis, travel advice and more.
          </p>
        </div>

        {/* Chat Box */}
        <div className="glass-card rounded-3xl h-[650px] flex flex-col">

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-5 space-y-3">

            {messages.map((msg, index) => (
              <div
                key={index}
                className={`flex ${
                  msg.role === "user"
                    ? "justify-end"
                    : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[80%] px-4 py-3 rounded-2xl ${
                    msg.role === "user"
                      ? "bg-sky-500 text-white"
                      : "bg-white/10 text-white border border-white/10"
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex justify-start">
                <div className="bg-white/10 border border-white/10 text-white px-4 py-3 rounded-2xl">
                  Thinking...
                </div>
              </div>
            )}

          </div>

          {/* Suggested Questions */}
          <div className="px-4 pb-3 flex flex-wrap gap-2">
            {[
              "Will it rain tomorrow?",
              "Is today good for travel?",
              "What clothes should I wear?",
              "Explain today's weather",
            ].map((q) => (
              <button
                key={q}
                onClick={() => setInput(q)}
                className="px-3 py-1.5 rounded-full bg-white/10 text-white/70 text-xs hover:bg-white/15"
              >
                {q}
              </button>
            ))}
          </div>

          {/* Input */}
          <div className="border-t border-white/10 p-4 flex gap-3">

            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleSend();
                }
              }}
              placeholder="Ask anything about weather..."
              className="
                flex-1
                bg-white/5
                border border-white/10
                rounded-xl
                px-4
                py-3
                text-white
                placeholder-white/40
                outline-none
              "
            />

            <button
              onClick={handleSend}
              disabled={loading}
              className="
                px-5
                rounded-xl
                bg-violet-500
                hover:bg-violet-600
                text-white
                font-medium
                disabled:opacity-50
              "
            >
              Send
            </button>

          </div>
        </div>
      </div>
    </div>
  );
};

export default AIAssistant;