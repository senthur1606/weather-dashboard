import React, {createContext,useContext,useState,useEffect} from 'react';

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

    localStorage.setItem(
      'skypulse-theme',
      isDark ? 'dark' : 'light'
    );
  }, [isDark]);

  const toggleTheme = () => {
    setIsDark((prev) => !prev);
  };

const getWeatherBgClass = () => {
  const prefix = isDark ? "bg-weather" : "bg-weather-light";

  if (isNight) return `${prefix}-night`;

  const condition = weatherCondition?.toLowerCase() || "";

  if (condition.includes("clear") || condition.includes("sunny"))
    return `${prefix}-clear`;

  if (condition.includes("cloud") || condition.includes("overcast"))
    return `${prefix}-cloudy`;

  if (condition.includes("rain") || condition.includes("drizzle"))
    return `${prefix}-rainy`;

  if (condition.includes("snow") || condition.includes("blizzard"))
    return `${prefix}-snowy`;

  if (condition.includes("storm") || condition.includes("thunder"))
    return `${prefix}-stormy`;

  if (condition.includes("fog") || condition.includes("mist"))
    return `${prefix}-foggy`;

  return `${prefix}-default`;
};

  return (
    <ThemeContext.Provider
      value={{
        isDark,
        toggleTheme,
        weatherCondition,
        setWeatherCondition,
        isNight,
        setIsNight,
        getWeatherBgClass,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error(
      'useTheme must be used within ThemeProvider'
    );
  }

  return context;
};

export default ThemeContext;