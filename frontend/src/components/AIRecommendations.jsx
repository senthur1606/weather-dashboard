import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from 'framer-motion';
import weatherApi from '../services/weatherApi';
import { FiCpu, FiRefreshCw } from 'react-icons/fi';

const AIRecommendations = ({ weatherData }) => {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
 const fetchRecs = useCallback(async () => {
  if (!weatherData) return;

  setLoading(true);

  try {
    console.log("Fetching AI recommendations for weather data:", weatherData);
    const res = await weatherApi.getRecommendations(weatherData);
    setRecommendations(res.data.recommendations || []);
  } catch {
    setRecommendations(['✨ Great weather for outdoor activities!']);
  } finally {
    setLoading(false);
  }
}, [weatherData]);

  useEffect(() => {fetchRecs();}, [fetchRecs]);
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
      whileHover={{ delay: 0.4 }}
      onClick={()=> navigate('/ai-assistant')}
      className="glass-card rounded-3xl p-6 cursor-pointer"
    >
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
            <FiCpu className="text-white" size={13} />
          </div>
          <h2 className="font-display font-semibold text-white text-lg">AI Insights</h2>
        </div>
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={fetchRecs}
          disabled={loading}
          className="w-8 h-8 rounded-xl bg-white/10 border border-white/15 flex items-center justify-center text-white/60 hover:text-white disabled:opacity-40"
        >
          <FiRefreshCw size={13} className={loading ? 'animate-spin' : ''} />
        </motion.button>
      </div>

      {loading ? (
        <div className="space-y-2">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="shimmer h-10 rounded-xl" />
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          <AnimatePresence>
            {recommendations.map((rec, i) => (
              <motion.div
                key={rec}
                initial={{ opacity: 0, x: -15 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.08 }}
                className="flex items-start gap-3 p-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/8 transition-all"
              >
                <span className="text-lg leading-none mt-0.5">{rec.split(' ')[0]}</span>
                <span className="text-white/80 text-sm font-body leading-snug">{rec.split(' ').slice(1).join(' ')}</span>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
      <button
      onClick={() => navigate("/ai-assistant")}
      className="mt-4 w-full py-2 rounded-xl bg-violet-500/20 text-violet-300 hover:bg-violet-500/30 transition-all"
      > 🤖 Open AI Assistant </button> 
      <div className="mt-4 flex items-center gap-1.5 text-white/30 text-xs">
        <FiCpu size={10} />
        <span className="font-body">Powered by AI analysis</span>
      </div>
    </motion.div>
  );
};

export default AIRecommendations;
