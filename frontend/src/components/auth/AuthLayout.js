import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import { FiSun, FiMoon } from 'react-icons/fi';

// Animated cloud SVG
const CloudSVG = ({ className, style }) => (
  <svg viewBox="0 0 200 80" className={className} style={style} fill="none" xmlns="http://www.w3.org/2000/svg">
    <ellipse cx="100" cy="50" rx="90" ry="30" fill="rgba(255,255,255,0.04)" />
    <ellipse cx="70" cy="40" rx="50" ry="28" fill="rgba(255,255,255,0.04)" />
    <ellipse cx="130" cy="44" rx="40" ry="22" fill="rgba(255,255,255,0.04)" />
  </svg>
);

// Weather effects canvas
const WeatherCanvas = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const container = canvasRef.current;
    if (!container) return;
    container.innerHTML = '';

    // Rain drops
    for (let i = 0; i < 35; i++) {
      const drop = document.createElement('div');
      drop.className = 'rain-drop';
      drop.style.cssText = `
        left: ${Math.random() * 100}%;
        top: ${-Math.random() * 100}px;
        height: ${15 + Math.random() * 30}px;
        animation-duration: ${0.8 + Math.random() * 0.7}s;
        animation-delay: ${Math.random() * 2}s;
        opacity: ${0.2 + Math.random() * 0.3};
      `;
      container.appendChild(drop);
    }

    // Stars / particles
    for (let i = 0; i < 60; i++) {
      const star = document.createElement('div');
      const size = Math.random() < 0.3 ? 2 : 1;
      star.style.cssText = `
        position: absolute;
        left: ${Math.random() * 100}%;
        top: ${Math.random() * 100}%;
        width: ${size}px;
        height: ${size}px;
        border-radius: 50%;
        background: rgba(255,255,255,${0.1 + Math.random() * 0.4});
        animation: pulse-ring ${2 + Math.random() * 4}s ease-out infinite;
        animation-delay: ${Math.random() * 3}s;
      `;
      container.appendChild(star);
    }
  }, []);

  return <div ref={canvasRef} className="absolute inset-0 overflow-hidden pointer-events-none" />;
};

const AuthLayout = ({ children, title, subtitle }) => {
  const { isDark, toggle } = useTheme();

  return (
    <div className="relative min-h-screen flex overflow-hidden">
      {/* Aurora gradient background */}
      <div className="aurora-bg" />

      {/* Weather effects */}
      <WeatherCanvas />

      {/* Drifting clouds */}
      {[0, 1, 2].map(i => (
        <CloudSVG
          key={i}
          className="absolute pointer-events-none"
          style={{
            width: `${200 + i * 80}px`,
            top: `${15 + i * 20}%`,
            animationName: 'cloud-drift',
            animationDuration: `${25 + i * 8}s`,
            animationDelay: `${i * -8}s`,
            animationTimingFunction: 'linear',
            animationIterationCount: 'infinite',
            transform: 'translateX(-200px)',
          }}
        />
      ))}

      {/* Large atmospheric blobs */}
      <div className="absolute top-1/4 -left-32 w-96 h-96 rounded-full blur-3xl pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(99,102,241,0.12) 0%, transparent 70%)' }} />
      <div className="absolute bottom-1/4 -right-32 w-96 h-96 rounded-full blur-3xl pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(16,185,129,0.08) 0%, transparent 70%)' }} />

      {/* Main layout */}
      <div className="relative z-10 w-full flex flex-col lg:flex-row">

        {/* Left panel — branding */}
        <motion.div
          initial={{ opacity: 0, x: -40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="hidden lg:flex lg:w-[45%] flex-col justify-between p-12 xl:p-16"
        >
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group w-fit">
            <motion.div
              animate={{ rotate: [0, 8, -8, 0] }}
              transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
              className="w-10 h-10 rounded-2xl flex items-center justify-center text-xl"
              style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', boxShadow: '0 4px 20px rgba(99,102,241,0.4)' }}
            >
              ☁️
            </motion.div>
            <span style={{ fontFamily: 'Syne, sans-serif' }} className="text-white font-bold text-xl tracking-tight">
              SkyPulse
            </span>
          </Link>

          {/* Hero content */}
          <div>
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.8 }}
            >
              <div className="flex items-center gap-2 mb-6">
                <div className="h-px flex-1 max-w-[40px]" style={{ background: 'rgba(99,102,241,0.6)' }} />
                <span className="text-xs font-medium tracking-[0.2em] uppercase" style={{ color: 'rgba(165,180,252,0.8)' }}>
                  Premium Weather
                </span>
              </div>

              <h1 style={{ fontFamily: 'Syne, sans-serif', lineHeight: 1.1 }}
                className="text-5xl xl:text-6xl font-bold text-white mb-6">
                Know the sky<br />
                <span className="text-gradient">before you fly.</span>
              </h1>

              <p className="text-base leading-relaxed max-w-sm" style={{ color: 'rgba(255,255,255,0.5)' }}>
                Real-time weather intelligence, 7-day forecasts, air quality monitoring,
                and AI-powered recommendations — all in one beautiful dashboard.
              </p>
            </motion.div>

            {/* Feature pills */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.7 }}
              className="flex flex-wrap gap-2 mt-8"
            >
              {['🌡️ Real-time data', '📍 Any city', '🤖 AI insights', '📊 Analytics'].map(f => (
                <div key={f} className="glass-card px-3 py-1.5 rounded-full text-sm"
                  style={{ color: 'rgba(255,255,255,0.65)' }}>
                  {f}
                </div>
              ))}
            </motion.div>
          </div>

          {/* Bottom quote */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="glass-card rounded-2xl p-5 max-w-sm"
          >
            <div className="flex gap-1 mb-3">
              {[...Array(5)].map((_, i) => (
                <span key={i} className="text-yellow-400 text-sm">★</span>
              ))}
            </div>
            <p className="text-sm italic mb-3" style={{ color: 'rgba(255,255,255,0.6)' }}>
              "The most beautiful weather app I've ever used. Somehow makes
              checking rain forecasts feel luxurious."
            </p>
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white"
                style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>A</div>
              <div>
                <div className="text-xs font-medium text-white/80">Alex Chen</div>
                <div className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>Product Designer</div>
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* Right panel — auth form */}
        <div className="flex-1 flex flex-col">
          {/* Top bar */}
          <div className="flex items-center justify-between p-6 lg:p-8">
            <Link to="/" className="flex items-center gap-2 lg:hidden">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center text-lg"
                style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>☁️</div>
              <span style={{ fontFamily: 'Syne, sans-serif' }} className="text-white font-bold">SkyPulse</span>
            </Link>
            <div className="ml-auto">
              <button
                onClick={toggle}
                className="w-9 h-9 rounded-xl glass-card flex items-center justify-center text-white/60 hover:text-white transition-colors"
              >
                {isDark ? <FiSun size={15} /> : <FiMoon size={15} />}
              </button>
            </div>
          </div>

          {/* Form area */}
          <div className="flex-1 flex items-center justify-center px-6 py-8">
            <motion.div
              initial={{ opacity: 0, y: 24, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
              className="w-full max-w-md"
            >
              {/* Card */}
              <div className="glass-card rounded-3xl p-8 md:p-10">
                {(title || subtitle) && (
                  <div className="mb-8">
                    {title && (
                      <h2 style={{ fontFamily: 'Syne, sans-serif' }}
                        className="text-2xl font-bold text-white mb-1.5">
                        {title}
                      </h2>
                    )}
                    {subtitle && (
                      <p className="text-sm" style={{ color: 'rgba(255,255,255,0.5)' }}>{subtitle}</p>
                    )}
                  </div>
                )}
                {children}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
