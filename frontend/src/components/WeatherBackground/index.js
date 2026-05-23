import React, { useEffect, useRef } from 'react';
import { useTheme } from '../../context/ThemeContext';

const WeatherBackground = () => {
  const { weatherCondition } = useTheme();
  const containerRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;
    container.innerHTML = '';

    const condition = weatherCondition?.toLowerCase() || '';

    if (condition.includes('rain') || condition.includes('drizzle')) {
      // Rain drops
      for (let i = 0; i < 60; i++) {
        const drop = document.createElement('div');
        drop.className = 'rain-drop';
        drop.style.cssText = `
          left: ${Math.random() * 100}%;
          height: ${20 + Math.random() * 60}px;
          animation-delay: ${Math.random() * 2}s;
          animation-duration: ${0.8 + Math.random() * 0.8}s;
          opacity: ${0.3 + Math.random() * 0.4};
          top: -100px;
        `;
        container.appendChild(drop);
      }
    } else if (condition.includes('snow') || condition.includes('blizzard')) {
      // Snowflakes
      const flakes = ['❄', '❅', '❆', '✦', '·'];
      for (let i = 0; i < 40; i++) {
        const flake = document.createElement('div');
        flake.className = 'snow-flake';
        flake.textContent = flakes[Math.floor(Math.random() * flakes.length)];
        flake.style.cssText = `
          left: ${Math.random() * 100}%;
          font-size: ${8 + Math.random() * 14}px;
          animation-delay: ${Math.random() * 5}s;
          animation-duration: ${4 + Math.random() * 6}s;
          opacity: ${0.4 + Math.random() * 0.4};
          top: -30px;
        `;
        container.appendChild(flake);
      }
    } else {
      // Default floating particles
      for (let i = 0; i < 20; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        const size = 4 + Math.random() * 16;
        particle.style.cssText = `
          left: ${Math.random() * 100}%;
          width: ${size}px;
          height: ${size}px;
          animation-delay: ${Math.random() * 8}s;
          animation-duration: ${10 + Math.random() * 15}s;
          opacity: ${0.05 + Math.random() * 0.08};
        `;
        container.appendChild(particle);
      }
    }
  }, [weatherCondition]);

  return (
    <div ref={containerRef} className="particles-container pointer-events-none" aria-hidden="true" />
  );
};

export default WeatherBackground;
