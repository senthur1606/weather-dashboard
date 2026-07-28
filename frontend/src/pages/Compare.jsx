import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import SearchBar from '../components/SearchBar';
import { getWeatherIcon, getTempColor } from '../utils/weatherUtils';
import weatherApi from '../services/weatherApi';
import { FiX, FiPlus } from 'react-icons/fi';
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer, Tooltip } from 'recharts';
import toast from 'react-hot-toast';

const MAX_CITIES = 3;

const CityCompareCard = ({ data, onRemove, color }) => {
  if (!data) return null;
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.8 }}
      className="glass-card rounded-2xl p-5 relative"
      style={{ borderColor: `${color}30` }}
    >
      <button
        onClick={onRemove}
        className="absolute top-3 right-3 w-6 h-6 rounded-lg bg-white/10 text-white/50 hover:text-white flex items-center justify-center transition-all"
      >
        <FiX size={12} />
      </button>

      <div className="flex items-center gap-2 mb-3">
        <div className="w-3 h-3 rounded-full" style={{ background: color }} />
        <div>
          <h3 className="font-display font-bold text-white text-lg leading-none">{data.city}</h3>
          <span className="text-white/40 text-xs font-body">{data.country}</span>
        </div>
      </div>

      <div className="flex items-center gap-3 mb-4">
        <span className="text-4xl">{getWeatherIcon(data.condition)}</span>
        <div>
          <div className="font-display font-extrabold text-3xl" style={{ color: getTempColor(data.temperature) }}>
            {data.temperature}°C
          </div>
          <div className="text-white/50 text-xs capitalize font-body">{data.description}</div>
        </div>
      </div>

      <div className="space-y-2 text-sm">
        {[
          { label: 'Feels Like', value: `${data.feels_like}°C` },
          { label: 'Humidity', value: `${data.humidity}%` },
          { label: 'Wind', value: `${data.wind_speed} km/h` },
          { label: 'Pressure', value: `${data.pressure} hPa` },
          { label: 'Visibility', value: `${data.visibility} km` },
          { label: 'UV Index', value: data.uv_index },
        ].map(({ label, value }) => (
          <div key={label} className="flex justify-between items-center py-1.5 border-b border-white/5">
            <span className="text-white/50 font-body">{label}</span>
            <span className="text-white font-mono font-medium">{value}</span>
          </div>
        ))}
      </div>
    </motion.div>
  );
};

const COLORS = ['#38bdf8', '#34d399', '#f97316'];

const Compare = () => {
  const [cities, setCities] = useState([]);
  const [weatherData, setWeatherData] = useState({});
  const [loading, setLoading] = useState({});

  const addCity = async (city) => {
    if (cities.includes(city)) { toast(`${city} already added`, { icon: 'ℹ️' }); return; }
    if (cities.length >= MAX_CITIES) { toast.error(`Max ${MAX_CITIES} cities for comparison`); return; }

    setCities(prev => [...prev, city]);
    setLoading(prev => ({ ...prev, [city]: true }));

    try {
      const res = await weatherApi.getCurrentWeather(city);
      setWeatherData(prev => ({ ...prev, [city]: res.data }));
    } catch {
      toast.error(`Failed to load weather for ${city}`);
      setCities(prev => prev.filter(c => c !== city));
    } finally {
      setLoading(prev => ({ ...prev, [city]: false }));
    }
  };

  const removeCity = (city) => {
    setCities(prev => prev.filter(c => c !== city));
    setWeatherData(prev => { const n = {...prev}; delete n[city]; return n; });
  };

  const radarData = cities.length > 0 ? [
    { metric: 'Temp', ...Object.fromEntries(cities.map(c => [c, Math.min(weatherData[c]?.temperature / 40 * 100 || 0, 100)])) },
    { metric: 'Humidity', ...Object.fromEntries(cities.map(c => [c, weatherData[c]?.humidity || 0])) },
    { metric: 'Wind', ...Object.fromEntries(cities.map(c => [c, Math.min(weatherData[c]?.wind_speed / 50 * 100 || 0, 100)])) },
    { metric: 'UV', ...Object.fromEntries(cities.map(c => [c, (weatherData[c]?.uv_index / 11) * 100 || 0])) },
    { metric: 'Visibility', ...Object.fromEntries(cities.map(c => [c, Math.min(weatherData[c]?.visibility / 10 * 100 || 0, 100)])) },
  ] : [];

  return (
    <div className="min-h-screen pt-24 pb-12 px-4 md:px-6">
      <div className="max-w-6xl mx-auto">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="font-display text-3xl md:text-4xl font-bold text-white mb-2">Compare Cities</h1>
          <p className="text-white/50 font-body">Compare weather conditions across up to {MAX_CITIES} cities</p>
        </motion.div>

        {/* Search */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} className="mb-8">
          <SearchBar
            onSelect={addCity}
            placeholder={cities.length < MAX_CITIES ? 'Add a city to compare...' : 'Maximum cities reached'}
            className="max-w-md"
          />
        </motion.div>

        {cities.length === 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-24">
            <div className="text-7xl mb-6">🌍</div>
            <h2 className="font-display text-2xl font-bold text-white mb-3">Add cities to compare</h2>
            <p className="text-white/50 font-body">Search and add up to 3 cities to compare their weather side by side.</p>
          </motion.div>
        ) : (
          <>
            {/* Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <AnimatePresence>
                {cities.map((city, idx) => (
                  loading[city] ? (
                    <div key={city} className="glass-card rounded-2xl p-5 animate-pulse">
                      <div className="shimmer h-40 rounded-xl" />
                    </div>
                  ) : (
                    <CityCompareCard
                      key={city}
                      data={weatherData[city]}
                      onRemove={() => removeCity(city)}
                      color={COLORS[idx]}
                    />
                  )
                ))}
              </AnimatePresence>

              {cities.length < MAX_CITIES && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="glass-card rounded-2xl p-5 border-dashed border-2 border-white/15 flex flex-col items-center justify-center gap-3 min-h-[300px]"
                >
                  <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center">
                    <FiPlus className="text-white/40" size={20} />
                  </div>
                  <p className="text-white/40 text-sm font-body text-center">Search above to add another city</p>
                </motion.div>
              )}
            </div>

            {/* Radar Chart */}
            {cities.length >= 2 && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card rounded-3xl p-6">
                <h2 className="font-display font-semibold text-white text-lg mb-6">Comparison Radar</h2>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart data={radarData}>
                      <PolarGrid stroke="rgba(255,255,255,0.1)" />
                      <PolarAngleAxis dataKey="metric" tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 12, fontFamily: 'DM Sans' }} />
                      {cities.map((city, idx) => (
                        <Radar key={city} name={city} dataKey={city}
                          stroke={COLORS[idx]} fill={COLORS[idx]} fillOpacity={0.15} strokeWidth={2} />
                      ))}
                      <Tooltip contentStyle={{ background: 'rgba(15,23,42,0.95)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12 }} />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex items-center gap-6 justify-center mt-4">
                  {cities.map((city, idx) => (
                    <div key={city} className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ background: COLORS[idx] }} />
                      <span className="text-white/70 text-sm font-body">{city}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Compare;
