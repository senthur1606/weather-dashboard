import React from 'react';
import { motion } from 'framer-motion';
import { getAQICategory } from '../utils/weatherUtils';

const AQIPollutant = ({ label, value, unit }) => (
  <div className="flex flex-col gap-1">
    <div className="text-white/50 text-xs font-body uppercase tracking-wide">{label}</div>
    <div className="text-white font-mono font-medium text-sm">{value} <span className="text-white/40 text-xs">{unit}</span></div>
  </div>
);

const AQIWidget = ({ data, loading }) => {
  if (loading) return (
    <div className="glass-card rounded-3xl p-6">
      <div className="shimmer w-32 h-6 rounded mb-4" />
      <div className="shimmer w-full h-32 rounded-2xl" />
    </div>
  );
  if (!data) return null;

  const aqiInfo = getAQICategory(data.aqi);
  const percentage = Math.min((data.aqi / 500) * 100, 100);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="glass-card rounded-3xl p-6"
    >
      <div className="flex items-center justify-between mb-5">
        <h2 className="font-display font-semibold text-white text-lg">Air Quality</h2>
        <motion.span
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="px-3 py-1 rounded-full text-xs font-semibold font-body"
          style={{ background: aqiInfo.bg, color: aqiInfo.color, border: `1px solid ${aqiInfo.color}33` }}
        >
          {aqiInfo.label}
        </motion.span>
      </div>

      {/* AQI Gauge */}
      <div className="relative mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-white/50 text-xs font-body">AQI</span>
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="font-display font-bold text-2xl"
            style={{ color: aqiInfo.color }}
          >
            {data.aqi}
          </motion.span>
        </div>
        <div className="h-2.5 rounded-full overflow-hidden bg-white/10">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${percentage}%` }}
            transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
            className="h-full rounded-full"
            style={{
              background: `linear-gradient(90deg, #22c55e, #eab308, #f97316, #ef4444, #a855f7)`,
              backgroundSize: '500px 100%',
              backgroundPosition: `-${(1 - percentage / 100) * 400}px 0`,
            }}
          />
        </div>
        <div className="flex justify-between text-white/30 text-[10px] mt-1 font-mono">
          <span>0</span><span>100</span><span>200</span><span>300</span><span>500</span>
        </div>
      </div>

      {/* Pollutants */}
      <div className="grid grid-cols-3 gap-4 p-4 rounded-2xl bg-white/5 border border-white/10">
        <AQIPollutant label="PM2.5" value={data.pm2_5} unit="μg/m³" />
        <AQIPollutant label="PM10" value={data.pm10} unit="μg/m³" />
        <AQIPollutant label="O₃" value={data.o3} unit="μg/m³" />
        <AQIPollutant label="NO₂" value={data.no2} unit="μg/m³" />
        <AQIPollutant label="SO₂" value={data.so2} unit="μg/m³" />
        <AQIPollutant label="CO" value={data.co} unit="mg/m³" />
      </div>
    </motion.div>
  );
};

export default AQIWidget;
