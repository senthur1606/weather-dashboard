import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, LineChart, Line
} from 'recharts';


const CustomTooltip = ({ active, payload, label, unit = '' }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass-card rounded-xl p-3 min-w-[120px]">
      <div className="text-white/60 text-xs mb-1 font-body">{label}</div>
      {payload.map((p, i) => (
        <div key={i} className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full" style={{ background: p.color }} />
          <span className="text-white font-mono text-sm font-semibold">{p.value}{unit}</span>
        </div>
      ))}
    </div>
  );
};

const Charts = ({ forecast, historical }) => {
  const [activeChart, setActiveChart] = useState('temperature');

  const dailyData = forecast?.daily?.map(d => ({
    name: d.day,
    high: d.high,
    low: d.low,
    precipitation: d.precipitation ?? 0,
    humidity: d.humidity,
    wind: d.wind_speed,
  })) || [];

  const hourlyData = forecast?.hourly?.slice(0, 12).map(h => ({
    name: h.hour,
    temp: h.temperature,
    precipitation: h.precipitation ?? 0,
    wind: h.wind_speed,
  })) || [];

  const charts = [
    { key: 'temperature', label: 'Temperature' },
    { key: 'precipitation', label: 'Rain' },
    { key: 'wind', label: 'Wind' },
    { key: 'humidity', label: 'Humidity' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="glass-card rounded-3xl p-6"
    >
      <div className="flex items-center justify-between mb-5">
        <h2 className="font-display font-semibold text-white text-lg">Analytics</h2>
        <div className="flex gap-1 flex-wrap">
          {charts.map(c => (
            <button
              key={c.key}
              onClick={() => setActiveChart(c.key)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all font-body ${
                activeChart === c.key
                  ? 'bg-sky-500/20 text-sky-400 border border-sky-500/30'
                  : 'text-white/40 hover:text-white/70'
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>

      <div className="h-52">
        <ResponsiveContainer width="100%" height="100%">
          {activeChart === 'temperature' ? (
            <AreaChart data={dailyData}>
              <defs>
                <linearGradient id="highGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f97316" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="lowGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#60a5fa" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#60a5fa" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="name" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11, fontFamily: 'DM Sans' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11, fontFamily: 'JetBrains Mono' }} axisLine={false} tickLine={false} unit="°" />
              <Tooltip content={<CustomTooltip unit="°C" />} />
              <Area type="monotone" dataKey="high" stroke="#f97316" strokeWidth={2} fill="url(#highGrad)" name="High" />
              <Area type="monotone" dataKey="low" stroke="#60a5fa" strokeWidth={2} fill="url(#lowGrad)" name="Low" />
            </AreaChart>
          ) : activeChart === 'precipitation' ? (
            <BarChart data={dailyData}>
              <defs>
                <linearGradient id="precipGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#38bdf8" stopOpacity={0.9} />
                  <stop offset="100%" stopColor="#38bdf8" stopOpacity={0.2} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="name" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11, fontFamily: 'DM Sans' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11, fontFamily: 'JetBrains Mono' }} axisLine={false} tickLine={false} unit="%" />
              <Tooltip content={<CustomTooltip unit="%" />} />
              <Bar dataKey="precipitation" fill="url(#precipGrad)" radius={[6, 6, 0, 0]} name="Precipitation" />
            </BarChart>
          ) : activeChart === 'wind' ? (
            <LineChart data={hourlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="name" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11, fontFamily: 'DM Sans' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11, fontFamily: 'JetBrains Mono' }} axisLine={false} tickLine={false} unit=" km/h" />
              <Tooltip content={<CustomTooltip unit=" km/h" />} />
              <Line type="monotone" dataKey="wind" stroke="#34d399" strokeWidth={2.5} dot={false} name="Wind Speed"
                activeDot={{ r: 5, fill: '#34d399', stroke: 'rgba(255,255,255,0.3)', strokeWidth: 2 }} />
            </LineChart>
          ) : (
            <AreaChart data={dailyData}>
              <defs>
                <linearGradient id="humidGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#a78bfa" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#a78bfa" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="name" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11, fontFamily: 'DM Sans' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11, fontFamily: 'JetBrains Mono' }} axisLine={false} tickLine={false} unit="%" />
              <Tooltip content={<CustomTooltip unit="%" />} />
              <Area type="monotone" dataKey="humidity" stroke="#a78bfa" strokeWidth={2} fill="url(#humidGrad)" name="Humidity" />
            </AreaChart>
          )}
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
};

export default Charts;
