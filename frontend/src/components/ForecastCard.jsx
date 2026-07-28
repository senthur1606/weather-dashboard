import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getWeatherIcon, getRelativeDay, getTempColor} from '../utils/weatherUtils';
import { FiDroplet} from 'react-icons/fi';

const ForecastCard = ({ data, loading }) => {
  const [view, setView] = useState('daily'); // 'daily' | 'hourly'

  if (loading) return <ForecastSkeleton />;
  if (!data) return null;

  const items = view === 'daily' ? (data.daily || []) : (data.hourly || []).slice(0, 24);
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className="glass-card rounded-3xl p-6"
    >
      <div className="flex items-center justify-between mb-5">
        <h2 className="font-display font-semibold text-white text-lg">Forecast</h2>
        <div className="flex gap-1 p-1 rounded-xl bg-white/5 border border-white/10">
          {['daily', 'hourly'].map(v => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 font-body capitalize ${
                view === v
                  ? 'bg-sky-500 text-white shadow-neon'
                  : 'text-white/50 hover:text-white'
              }`}
            >
              {v === 'daily' ? '7-Day' : '24h'}
            </button>
          ))}
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={view}
          initial={{ opacity: 0, x: view === 'daily' ? -20 : 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: view === 'daily' ? 20 : -20 }}
          transition={{ duration: 0.25 }}
        >
          {view === 'daily' ? (
            <div className="space-y-2">
              {items.map((day, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  whileHover={{ scale: 1.01, backgroundColor: 'rgba(255,255,255,0.08)' }}
                  className="flex items-center justify-between p-3 rounded-2xl transition-all cursor-pointer border border-transparent hover:border-white/10"
                >
                  <div className="w-20 text-white/70 text-sm font-body font-medium">
                    {getRelativeDay(day.date)}
                  </div>
                  <div className="text-2xl">{getWeatherIcon(day.condition)}</div>
                  <div className="flex items-center gap-1 text-blue-400 text-xs">
                    <FiDroplet size={11} />
                    <span className="font-mono">{day.precipitation ?? '—'}%</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm font-mono">
                    <span className="font-semibold" style={{ color: getTempColor(day.high) }}>{day.high}°</span>
                    <span className="text-white/30">/</span>
                    <span className="text-white/50">{day.low}°</span>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="overflow-x-auto -mx-2 px-2">
              <div className="flex gap-3 pb-2" style={{ width: 'max-content' }}>
                {items.map((hour, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.02 }}
                    whileHover={{ scale: 1.05, y: -2 }}
                    className="flex flex-col items-center gap-2 p-3 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/15 transition-all min-w-[70px]"
                  >
                    <span className="text-white/50 text-xs font-mono">{hour.hour}</span>
                    <span className="text-xl">{getWeatherIcon(hour.condition)}</span>
                    <span className="font-display font-bold text-white text-sm" style={{ color: getTempColor(hour.temperature) }}>
                      {hour.temperature}°
                    </span>
                    <div className="flex items-center gap-0.5 text-blue-400 text-[10px]">
                      <FiDroplet size={9} />
                      <span className="font-mono">{hour.precipitation}%</span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </motion.div>
  );
};

const ForecastSkeleton = () => (
  <div className="glass-card rounded-3xl p-6">
    <div className="flex justify-between mb-5">
      <div className="shimmer w-24 h-6 rounded" />
      <div className="shimmer w-28 h-8 rounded-xl" />
    </div>
    <div className="space-y-2">
      {[...Array(7)].map((_, i) => (
        <div key={i} className="shimmer h-12 rounded-2xl" />
      ))}
    </div>
  </div>
);

export default ForecastCard;
