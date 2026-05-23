import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem('skypulse-theme');
    return saved ? saved === 'dark' : true;
  });

  const [weatherCondition, setWeatherCondition] = useState('default');
  const [isNight, setIsNight] = useState(false);

  useEffect(() => {
    const root = document.documentElement;
    if (isDark) {
      root.classList.add('dark');
      document.body.classList.remove('light-mode');
    } else {
      root.classList.remove('dark');
      document.body.classList.add('light-mode');
    }
    localStorage.setItem('skypulse-theme', isDark ? 'dark' : 'light');
  }, [isDark]);

  const toggleTheme = () => setIsDark(prev => !prev);

  const getWeatherBgClass = () => {
    if (isNight) return 'bg-weather-night';
    const map = {
      clear: 'bg-weather-clear',
      sunny: 'bg-weather-clear',
      cloudy: 'bg-weather-cloudy',
      overcast: 'bg-weather-cloudy',
      rainy: 'bg-weather-rainy',
      rain: 'bg-weather-rainy',
      drizzle: 'bg-weather-rainy',
      snowy: 'bg-weather-snowy',
      snow: 'bg-weather-snowy',
      stormy: 'bg-weather-stormy',
      storm: 'bg-weather-stormy',
      thunderstorm: 'bg-weather-stormy',
      foggy: 'bg-weather-foggy',
      fog: 'bg-weather-foggy',
      mist: 'bg-weather-foggy',
    };
    return map[weatherCondition?.toLowerCase()] || 'bg-weather-default';
  };

  return (
    <ThemeContext.Provider value={{
      isDark,
      toggleTheme,
      weatherCondition,
      setWeatherCondition,
      isNight,
      setIsNight,
      getWeatherBgClass,
    }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
};

export default ThemeContext;
