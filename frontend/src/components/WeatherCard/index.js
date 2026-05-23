import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../../context/ThemeContext';
import {
  degToCompass, getWeatherIcon, getUVCategory,
  getTempColor, formatTime
} from '../../utils/weatherUtils';
import {
  WiHumidity, WiStrongWind, WiBarometer, WiSunrise,
  WiSunset
} from 'react-icons/wi';
import { FiEye } from 'react-icons/fi';

const StatCard = ({ icon: Icon, label, value, unit, color, size = 'default' }) => (
  <motion.div
    whileHover={{ scale: 1.03 }}
    className="glass-card rounded-2xl p-4 flex flex-col gap-2"
  >
    <div className="flex items-center gap-2 text-white/50">
      <Icon size={16} style={{ color: color || 'inherit' }} />
      <span className="text-xs font-body uppercase tracking-wide">{label}</span>
    </div>
    <div className="flex items-end gap-1">
      <span className="text-xl font-display font-bold text-white">{value}</span>
      {unit && <span className="text-sm text-white/50 mb-0.5">{unit}</span>}
    </div>
  </motion.div>
);

const WeatherCard = ({ data, loading }) => {
  const { setWeatherCondition, setIsNight } = useTheme();

  useEffect(() => {
    if (data?.condition) {
      setWeatherCondition(data.condition);
      const hour = new Date().getHours();
      setIsNight(hour < 6 || hour > 20);
    }
  }, [data, setWeatherCondition, setIsNight]);

  if (loading) return <WeatherCardSkeleton />;
  if (!data) return null;

  const uvInfo = getUVCategory(data.uv_index);
  const tempColor = getTempColor(data.temperature);
  const icon = getWeatherIcon(data.condition);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="glass-card rounded-3xl p-6 md:p-8 relative overflow-hidden"
    >
      {/* Decorative background glow */}
      <div
        className="absolute -top-20 -right-20 w-60 h-60 rounded-full blur-3xl opacity-20 pointer-events-none"
        style={{ background: `radial-gradient(circle, ${tempColor}, transparent)` }}
      />

      {/* Header: City + Icon */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="flex items-center gap-2 mb-1"
          >
            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            <span className="text-white/60 text-sm font-body">{data.country}</span>
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="font-display text-3xl md:text-4xl font-bold text-white leading-tight"
          >
            {data.city}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-white/50 text-sm font-body capitalize mt-1"
          >
            {data.description}
          </motion.p>
        </div>

        <motion.div
          animate={{ y: [0, -8, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          className="text-6xl md:text-7xl select-none filter drop-shadow-lg"
        >
          {icon}
        </motion.div>
      </div>

      {/* Temperature */}
      <div className="flex items-end gap-4 mb-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.25, type: 'spring', stiffness: 200 }}
          className="font-display font-extrabold leading-none"
          style={{ fontSize: 'clamp(4rem, 12vw, 7rem)', color: tempColor }}
        >
          {data.temperature}°
        </motion.div>
        <div className="pb-4">
          <div className="text-white/60 text-base font-body">
            Feels <span className="text-white font-medium">{data.feels_like}°C</span>
          </div>
          <div className="text-white/50 text-sm">{data.condition}</div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard icon={WiHumidity} label="Humidity" value={data.humidity} unit="%" color="#60a5fa" />
        <StatCard icon={WiStrongWind} label="Wind" value={`${data.wind_speed} ${degToCompass(data.wind_deg)}`} unit="km/h" color="#34d399" />
        <StatCard icon={WiBarometer} label="Pressure" value={data.pressure} unit="hPa" color="#a78bfa" />
        <StatCard icon={FiEye} label="Visibility" value={data.visibility} unit="km" color="#f59e0b" />
      </div>

      {/* Sunrise / Sunset */}
      <div className="flex items-center gap-4 mt-4 p-4 rounded-2xl bg-white/5 border border-white/10">
        <div className="flex items-center gap-2 flex-1">
          <WiSunrise className="text-amber-400" size={28} />
          <div>
            <div className="text-white/50 text-xs font-body">Sunrise</div>
            <div className="text-white font-medium font-mono text-sm">{formatTime(data.sunrise)}</div>
          </div>
        </div>
        <div className="w-px h-8 bg-white/15" />
        <div className="flex items-center gap-2 flex-1">
          <WiSunset className="text-orange-400" size={28} />
          <div>
            <div className="text-white/50 text-xs font-body">Sunset</div>
            <div className="text-white font-medium font-mono text-sm">{formatTime(data.sunset)}</div>
          </div>
        </div>
        <div className="w-px h-8 bg-white/15" />
        <div className="flex items-center gap-2 flex-1">
          <div className="w-5 h-5 rounded-full flex-shrink-0" style={{ background: uvInfo.color, boxShadow: `0 0 10px ${uvInfo.color}` }} />
          <div>
            <div className="text-white/50 text-xs font-body">UV Index</div>
            <div className="text-white font-medium text-sm" style={{ color: uvInfo.color }}>
              {data.uv_index} · {uvInfo.label}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const WeatherCardSkeleton = () => (
  <div className="glass-card rounded-3xl p-8 animate-pulse">
    <div className="flex justify-between mb-6">
      <div>
        <div className="shimmer w-20 h-3 rounded mb-2" />
        <div className="shimmer w-40 h-9 rounded mb-2" />
        <div className="shimmer w-28 h-4 rounded" />
      </div>
      <div className="shimmer w-20 h-20 rounded-full" />
    </div>
    <div className="shimmer w-48 h-24 rounded mb-6" />
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="shimmer h-20 rounded-2xl" />
      ))}
    </div>
  </div>
);

export default WeatherCard;
