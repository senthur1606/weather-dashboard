import React, { useEffect, useRef } from 'react';
import { useTheme } from '../../context/ThemeContext';

const WeatherBackground = () => {
  const { weatherCondition } = useTheme();
  const containerRef = useRef(null);

useEffect(() => {
  if (!containerRef.current) return;

  const container = containerRef.current;
  container.innerHTML = "";

  const condition =
    weatherCondition?.toLowerCase() || "";

  // 🌧️ Rain
  if (
    condition.includes("rain") ||
    condition.includes("drizzle")
  ) {
    for (let i = 0; i < 60; i++) {
      const drop = document.createElement("div");

      drop.className = "rain-drop";

      drop.style.cssText = `
        left:${Math.random() * 100}%;
        height:${20 + Math.random() * 60}px;
        animation-delay:${Math.random() * 2}s;
        animation-duration:${0.8 + Math.random() * 0.8}s;
        opacity:${0.3 + Math.random() * 0.4};
        top:-100px;
      `;

      container.appendChild(drop);
    }
  }

  // ❄️ Snow
  else if (
    condition.includes("snow") ||
    condition.includes("blizzard")
  ) {
    const flakes = ["❄", "❅", "❆"];

    for (let i = 0; i < 50; i++) {
      const flake = document.createElement("div");

      flake.className = "snow-flake";
      flake.textContent =
        flakes[Math.floor(Math.random() * flakes.length)];

      flake.style.cssText = `
        left:${Math.random() * 100}%;
        font-size:${10 + Math.random() * 15}px;
        animation-delay:${Math.random() * 5}s;
        animation-duration:${4 + Math.random() * 6}s;
        opacity:${0.5};
        top:-20px;
      `;

      container.appendChild(flake);
    }
  }

  // ⛈️ Thunderstorm
else if (
  condition.includes("thunder") ||
  condition.includes("storm")
){
const bolt = document.createElement("div");
bolt.className = "lightning-bolt";

bolt.style.left = `${20 + Math.random() * 60}%`;

container.appendChild(bolt);

    for (let i = 0; i < 50; i++) {
      const drop = document.createElement("div");

      drop.className = "rain-drop";

      drop.style.cssText = `
        left:${Math.random() * 100}%;
        height:${20 + Math.random() * 60}px;
        animation-delay:${Math.random() * 2}s;
        animation-duration:${0.8 + Math.random() * 0.8}s;
        opacity:${0.4};
      `;

      container.appendChild(drop);
    }
  }

  // ☁️ Cloudy
  else if (
    condition.includes("cloud") ||
    condition.includes("overcast")
  ) {
    for (let i = 0; i < 8; i++) {
      const cloud = document.createElement("div");

      cloud.className = "cloud";

      cloud.style.cssText = `
        top:${10 + Math.random() * 70}%;
        animation-delay:${Math.random() * 20}s;
        animation-duration:${30 + Math.random() * 20}s;
      `;

      container.appendChild(cloud);
    }
  }

  // 🌫️ Fog
  else if (
    condition.includes("fog") ||
    condition.includes("mist")
  ) {
    for (let i = 0; i < 4; i++) {
      const fog = document.createElement("div");

      fog.className = "fog-layer";

      fog.style.top = `${i * 25}%`;

      container.appendChild(fog);
    }
  }

  // ☀️ Clear Sky
  else if (
    condition.includes("clear") ||
    condition.includes("sun")
  ) {
    for (let i = 0; i < 40; i++) {
      const particle =
        document.createElement("div");

      particle.className = "sun-particle";

      particle.style.cssText = `
        left:${Math.random() * 100}%;
        top:${Math.random() * 100}%;
        animation-delay:${Math.random() * 5}s;
      `;

      container.appendChild(particle);
    }
  }

  // ✨ Default
  else {
    for (let i = 0; i < 25; i++) {
      const particle =
        document.createElement("div");

      particle.className = "particle";

      const size = 4 + Math.random() * 10;

      particle.style.cssText = `
        left:${Math.random() * 100}%;
        width:${size}px;
        height:${size}px;
        animation-delay:${Math.random() * 8}s;
        animation-duration:${10 + Math.random() * 15}s;
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
